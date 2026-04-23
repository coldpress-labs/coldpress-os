/**
 * PERT → stories handoff schema (high-stakes, registry entry #6).
 *
 * Emitted by `parallelization-strategy` (Phase 5). Consumed by
 * `create-stories` (Phase 5). The sidecar `pert-chart.meta.json` carries
 * the wave plan + epic assignments in a form stories can mechanically
 * inherit from.
 *
 * Per plan §3.8: schema covers "epic assignment, wave number, acceptance
 * criteria shape."
 */

import { z } from "zod";

export const Epic = z.object({
  /** Stable identifier referenced by stories + tracking. */
  id: z.string().min(1),
  /** Human label. */
  name: z.string().min(1),
  /** Epic scope summary (1-3 sentences). */
  summary: z.string().min(10),
  /** Which architectural component(s) this epic primarily delivers. */
  components: z.array(z.string().min(1)).min(1),
});

export const WaveAssignment = z.object({
  /** Wave number (1-indexed). Each wave is a set of epics that can run in parallel. */
  wave: z.number().int().min(1),
  /** Epics assigned to this wave. */
  epic_ids: z.array(z.string().min(1)).min(1),
  /** Cross-wave dependencies this wave consumes — all must be complete before this wave starts. */
  depends_on_waves: z.array(z.number().int().min(1)),
  /** Human-readable justification for the grouping. */
  rationale: z.string().min(10),
});

/**
 * Acceptance-criteria shape — what EVERY story in this epic must look like.
 * `create-stories` inherits this shape; stories that violate it fail validation
 * downstream.
 */
export const AcceptanceCriteriaShape = z.object({
  /** Required section names in each story's "Acceptance Criteria" block. */
  required_sections: z.array(
    z.enum([
      "functional",
      "non-functional",
      "edge-cases",
      "test-data",
      "rollback",
      "observability",
    ]),
  ).min(1),
  /** Minimum number of bullet items per required section. */
  min_items_per_section: z.number().int().min(1),
  /** Free-form notes that flow into every story's template. */
  notes: z.string().optional(),
});

/**
 * Full `pert-chart.meta.json` shape. Consumer (create-stories) reads this
 * to produce stories that inherit epic assignment, wave number, and the
 * acceptance-criteria shape.
 */
export const PertToStoriesSchema = z.object({
  schema_version: z.literal(1),
  produced_by: z.literal("parallelization-strategy"),
  produced_at: z.string().datetime(),
  project_slug: z.string().min(1),
  upstream_architecture_path: z.string().min(1),
  /** Total wave count — consumers assert all their stories land in a known wave. */
  wave_count: z.number().int().min(1),
  epics: z.array(Epic).min(1),
  waves: z.array(WaveAssignment).min(1),
  acceptance_criteria_shape: AcceptanceCriteriaShape,
});

export type PertToStories = z.infer<typeof PertToStoriesSchema>;
