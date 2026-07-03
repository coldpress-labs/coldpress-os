/**
 * stories → implementation handoff schema (high-stakes, registry entry #7).
 *
 * Emitted by `story-slice` (Phase 7; formerly `create-stories`). Consumed by
 * `dev-story` / `quick-dev` (Phase 8). Each story ships a sidecar
 * `<story>.meta.json` — this schema validates one story at a time
 * (unlike the upstream schemas which describe an aggregate artefact).
 *
 * Per plan §3.8: schema covers "file scope, test coverage target."
 */

import { z } from "zod";

export const FileScope = z.object({
  /** Project-relative path (e.g., "src/features/auth/login.ts"). */
  path: z.string().min(1),
  /** Intent — consumer uses this to plan the diff. */
  intent: z.enum(["create", "modify", "delete"]),
  /** Why this file is in scope (anchor to acceptance criterion ID). */
  why: z.string().min(5),
});

export const TestCoverageTarget = z.object({
  /** Coverage scope — unit / integration / e2e / contract / load / etc. */
  scope: z.enum([
    "unit",
    "integration",
    "e2e",
    "contract",
    "load",
    "accessibility",
    "security",
  ]),
  /** Concrete target — e.g., "90% branch coverage on src/features/auth/**". */
  target: z.string().min(5),
  /** Measurement — how `@qa` verifies the target was hit. */
  measurement: z.string().min(5),
});

/**
 * Full `<story>.meta.json` shape. Consumer (dev-story / quick-dev) reads
 * this before opening any file — the file-scope list is the diff boundary.
 */
export const StoriesToImplementationSchema = z.object({
  schema_version: z.literal(1),
  produced_by: z.literal("story-slice"),
  produced_at: z.string().datetime(),
  project_slug: z.string().min(1),
  /** Story ID from PERT's epic.id + local story number, e.g., "E2.S3". */
  story_id: z.string().min(1),
  /** The epic this story belongs to (from the PERT sidecar). */
  epic_id: z.string().min(1),
  /** Wave number — developer can check context for siblings in the same wave. */
  wave: z.number().int().min(1),
  /** Upstream story-graph for traceability (was the PERT sidecar; PERT retired). */
  upstream_graph_path: z.string().min(1),
  /** 1-line story summary for quick ref. */
  summary: z.string().min(10),
  /** File scope — the developer does not open files outside this list. */
  file_scope: z.array(FileScope).min(1),
  /** Test coverage targets — qa's inputs for verifying the story. */
  test_coverage_targets: z.array(TestCoverageTarget).min(1),
  /** Acceptance-criteria IDs from the story.md body — enables traceability matrices. */
  acceptance_criteria_ids: z.array(z.string().min(1)).min(1),
});

export type StoriesToImplementation = z.infer<typeof StoriesToImplementationSchema>;
