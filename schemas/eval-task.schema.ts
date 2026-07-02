/**
 * Golden eval-task schema (v0.4 WS7, §4.8). A framework eval task — what
 * `coldpress evals` runs headlessly, scoring pass/fail. **Deterministic scoring
 * first** (gates pass, schema valid, files exist, tests green); model-graded
 * `rubric` checks only where unavoidable.
 *
 * Framework evals ≠ product evals: these test the framework (does the skill do
 * the right thing?). Product LLM-app evals use the `eval:` config + src/llm-gates/.
 *
 * Instance: `evals/<lane-or-pack>/<task-id>.yaml`.
 */

import { z } from "zod";

/** One deterministic (or, last resort, rubric) scoring check. */
export const EvalCheckSchema = z
  .object({
    kind: z.enum([
      "file-exists", // target: a glob/path that must exist after the run
      "file-absent", // target: a path that must NOT exist (e.g. no stray edit)
      "gate-green", // target: a gate id that must be green in state.yaml
      "schema-valid", // target: "<artifact-path>::<schema>" — artifact validates
      "tests-green", // target: a test command that must exit 0
      "grep", // target: "<path>::<regex>" — pattern must be present
      "grep-absent", // target: "<path>::<regex>" — pattern must be absent
      "no-secret", // target: a path tree that must contain no committed secret
      "rubric", // target: a model-graded rubric prompt (use sparingly)
    ]),
    target: z.string().min(1),
    /** Optional human note on what this check protects. */
    note: z.string().optional(),
  })
  .strict();
export type EvalCheck = z.infer<typeof EvalCheckSchema>;

export const EvalTaskSchema = z
  .object({
    schema_version: z.literal(1),
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    description: z.string().min(1),
    /** Which lane this task exercises. `any` = lane-agnostic. */
    lane: z.enum(["lite", "full", "any"]).default("any"),
    /** Stack pack exercised, when pack-specific (§5 P3: 3–5 golden tasks per pack). */
    stack_pack: z.string().optional(),
    /** The instruction given to the agent under test. */
    prompt: z.string().min(1),
    /** Deterministic-first scoring checks; ALL must pass for the task to pass. */
    checks: z.array(EvalCheckSchema).min(1),
    /**
     * Failure classes a wrong solution is expected to trip — links the task to
     * the taxonomy so a regression is tagged automatically (must be valid ids).
     */
    guards_against: z.array(z.string()).default([]),
    /** Wall-clock budget (seconds) before the task is scored as a timeout/fail. */
    timeout_s: z.number().int().positive().default(600),
  })
  .strict();
export type EvalTask = z.infer<typeof EvalTaskSchema>;

/** One task's result, appended to the eval run report. */
export const EvalResultSchema = z
  .object({
    task_id: z.string(),
    passed: z.boolean(),
    /** Per-check outcomes (kind + target + passed). */
    checks: z.array(z.object({ kind: z.string(), target: z.string(), passed: z.boolean() })),
    /** Taxonomy tags attributed on failure (subset of guards_against + observed). */
    taxonomy_tags: z.array(z.string()).default([]),
    duration_ms: z.number().int().nonnegative().optional(),
  })
  .strict();
export type EvalResult = z.infer<typeof EvalResultSchema>;
