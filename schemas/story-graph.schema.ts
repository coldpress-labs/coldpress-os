/**
 * Story-graph schema (action plan §4.7 / G1) — replaces the sacred PERT chart.
 *
 * Instance: `_context/implementation/story-graph.yaml`. `coldpress waves` (WS2)
 * validates it (acyclic DAG; a contract story on every `interface` edge; intra-
 * wave ownership disjointness) and derives `waves.yaml` + `schedule.yaml` +
 * a mermaid render — waves and the critical path are COMPUTED, never authored.
 *
 * Story kinds:
 *   - `story` (ST-*) — a normal unit of work.
 *   - `contract` (CT-*) — types/API-shape only; runs first in its wave, outputs
 *     frozen for the wave (boundary-guard enforced).
 *   - `integration` (IN-<wave>) — auto-generated sequential merge + full suite.
 */

import { z } from "zod";

/** PERT three-point estimate. Critical path uses (o + 4m + p) / 6. */
export const EstimateSchema = z
  .object({
    o: z.number().nonnegative(), // optimistic
    m: z.number().nonnegative(), // most likely
    p: z.number().nonnegative(), // pessimistic
  })
  .refine((e) => e.o <= e.m && e.m <= e.p, {
    message: "estimate must satisfy o <= m <= p",
  });
export type Estimate = z.infer<typeof EstimateSchema>;

export const RiskEnum = z.enum(["low", "medium", "high"]);
export const StoryKindEnum = z.enum(["story", "contract", "integration"]);
export const EdgeKindEnum = z.enum(["blocks", "interface", "informs"]);
export type EdgeKind = z.infer<typeof EdgeKindEnum>;

export const StorySchema = z
  .object({
    /** Story id — ST-*, CT-* (contract), or IN-* (integration). */
    id: z.string().min(1),
    title: z.string().optional(),
    kind: StoryKindEnum.default("story"),
    estimate: EstimateSchema,
    /** Forced `high` on security-registry paths (§5 P7). */
    risk: RiskEnum.default("medium"),
    /** Globs this story exclusively owns (writes). Used for wave disjointness. */
    owns: z.array(z.string()).default([]),
    /** Globs this story produces (a superset/refinement of owns). */
    produces: z.array(z.string()).default([]),
    /** Globs/ids this story consumes (reads). */
    consumes: z.array(z.string()).default([]),
    /** Styleguide component references for UI stories (§5 P7). */
    styleguide_refs: z.array(z.string()).optional(),
    /** True when the story touches a security-registry path. */
    security_registry: z.boolean().optional(),
  })
  .strict();
export type Story = z.infer<typeof StorySchema>;

export const EdgeSchema = z
  .object({
    from: z.string().min(1),
    to: z.string().min(1),
    /**
     * `blocks` — hard dependency (sequencing). `interface` — a shared type/API
     * boundary (requires a contract story). `informs` — soft, non-blocking.
     */
    type: EdgeKindEnum,
  })
  .strict();
export type Edge = z.infer<typeof EdgeSchema>;

export const StoryGraphSchema = z
  .object({
    stories: z.array(StorySchema).min(1),
    edges: z.array(EdgeSchema).default([]),
  })
  .strict();
export type StoryGraph = z.infer<typeof StoryGraphSchema>;

export function parseStoryGraph(input: unknown): StoryGraph {
  return StoryGraphSchema.parse(input);
}
