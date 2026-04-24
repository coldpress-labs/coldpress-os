/**
 * Orchestrator-resumption checkpoint schema (§6.5).
 *
 * Ports the LangGraph `BaseCheckpointSaver` + `interrupt()` primitive
 * pattern (NOT the code) into coldpress-os. A checkpoint is a snapshot
 * of orchestrator state at an interruptible point — typically a phase
 * boundary, a `<NEED_INFO>` emission, or any other point where the
 * caller wants the option to pause-and-resume.
 *
 * Persisted at `.coldpress/runs/<run-id>/checkpoint.json`. One
 * checkpoint per file; subsequent saves overwrite. Time-travel to a
 * prior wave is achieved by walking the EventStream backward to the
 * desired `seq` and authoring a checkpoint that anchors to it.
 *
 * Hard rules:
 *   - `run_id` must match the EventStream run the checkpoint anchors to.
 *   - `last_event_seq` is the EventStream `seq` immediately preceding
 *     the interruption point — readers MUST verify the EventStream is
 *     at-least that long before resuming.
 *   - `state` is opaque application state; the schema doesn't
 *     constrain its shape because checkpointable state evolves with
 *     the orchestrator. Use Zod schemas at the application layer.
 */

import { z } from "zod";

const RUN_ID = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "run_id must be a kebab-case slug");

export const InterruptKindEnum = z.enum([
  "phase-boundary",
  "need-info",
  "human-gate",
  "manual",
  "error",
]);
export type InterruptKind = z.infer<typeof InterruptKindEnum>;

export const CheckpointSchema = z.object({
  schema_version: z.literal(1),
  run_id: RUN_ID,
  created_at: z.string().datetime(),
  /**
   * EventStream `seq` immediately before the interruption point. The
   * resumer reads this to verify the EventStream hasn't drifted. If
   * the live EventStream's tail is at a higher seq than this, refuse
   * to resume — state has already moved forward without the
   * checkpoint's knowledge.
   */
  last_event_seq: z.number().int().nonnegative(),
  /**
   * Why the interruption happened. Used by the dashboard / inspector
   * to label the resume point.
   */
  interrupt_kind: InterruptKindEnum,
  /**
   * Free-form one-paragraph description of the resume point — what
   * the orchestrator was about to do, what input it's waiting for.
   */
  reason: z.string().min(1),
  /**
   * Opaque application state. The schema explicitly does not constrain
   * the shape — orchestrator authors layer their own Zod schemas on
   * top. Treat as JSON-serialisable; no functions, no symbols, no
   * non-finite numbers.
   */
  state: z.unknown(),
});

export type Checkpoint = z.infer<typeof CheckpointSchema>;

/**
 * Skill-invocation cache entry (Prefect-style content-addressed task
 * cache). Hash the inputs of a skill invocation; if the hash matches a
 * previously-stored entry, skip re-running and reuse the cached
 * result. Lives at `.coldpress/cache/skill-results/<hash>.json`.
 *
 * Hash inputs: `skill_id` + canonical-JSON-stringified args + a
 * hand-curated `version_marker` per skill (so a skill can opt out of
 * an entry by bumping its marker — equivalent to Prefect's
 * `cache_key_fn`).
 */
export const SkillCacheEntrySchema = z.object({
  schema_version: z.literal(1),
  hash: z.string().min(1),
  skill_id: z.string().min(1),
  /**
   * The skill's content-cache version. Bumping this invalidates every
   * prior cached entry for the skill.
   */
  version_marker: z.string().min(1),
  cached_at: z.string().datetime(),
  /**
   * The cached result. `result_path` (artefact location) + `exit_code`
   * + optional message. Mirrors the EventStream `skill-result`
   * observation shape so consumers can substitute one for the other.
   */
  result: z.object({
    exit_code: z.number().int(),
    artifact_path: z.string().optional(),
    message: z.string().optional(),
  }),
  /**
   * The inputs used to compute the hash (kept for audit). Sensitive
   * values should be redacted at the call site BEFORE entering the
   * cache; the cache trusts the caller to redact.
   */
  inputs: z.unknown(),
});

export type SkillCacheEntry = z.infer<typeof SkillCacheEntrySchema>;
