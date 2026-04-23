/**
 * `coldpress.yaml` `eval:` section schema (§5.5–§5.7).
 *
 * Declares which LLM-specific gates the project opts into, plus the
 * inputs those gates need (prompt/agent endpoints, test datasets,
 * thresholds).
 *
 * When the block is absent from `coldpress.yaml`, the three LLM gates
 * (llm-quality-gate / prompt-regression / llm-security-scan) degrade
 * to warn-severity no-ops in the phase-7 gate — they don't fail gates
 * for projects that aren't LLM-centric.
 */

import { z } from "zod";

export const EvalSeverityEnum = z.enum(["critical", "high", "medium", "low", "info"]);

/**
 * One declared prompt/agent to evaluate. DeepEval + Promptfoo + Giskard
 * all take different invocation shapes; the adapter translates to each
 * tool's native config format.
 */
export const EvalTargetSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "target id must be a kebab-case slug"),
  description: z.string().optional(),
  /**
   * The prompt template or endpoint to evaluate. Interpretation depends
   * on tool:
   *   - DeepEval: path to a Python test module / prompt definition.
   *   - Promptfoo: string template or `file://` ref consumed by
   *     promptfooconfig.yaml's `prompts:` block.
   *   - Giskard: endpoint URL + auth ref for `giskard scan`.
   */
  prompt_ref: z.string().min(1),
  /** Optional tool-specific extras merged into the tool's native config. */
  extras: z.record(z.string(), z.unknown()).optional(),
});

export const DeepEvalConfigSchema = z.object({
  enabled: z.boolean().default(true),
  /**
   * DeepEval metric names. Defaults per plan §5.5:
   * faithfulness / hallucination / g_eval / answer_relevancy.
   * Projects may extend with custom metrics (DeepEval supports BYO).
   */
  metrics: z
    .array(z.string().min(1))
    .default(["faithfulness", "hallucination", "g_eval", "answer_relevancy"]),
  /**
   * Severity a failing metric is mapped to in the normalised ScanResult.
   * Default `high` matches the §5.1 default block_severity so a DeepEval
   * failure trips the Phase-7 block-severity floor.
   */
  fail_severity: EvalSeverityEnum.default("high"),
});

export const PromptfooConfigSchema = z.object({
  enabled: z.boolean().default(true),
  /**
   * Path to the promptfooconfig.yaml at project root. Defaults to the
   * canonical location.
   */
  config_path: z.string().default("promptfooconfig.yaml"),
  /**
   * Severity on regression. Promptfoo gates on drift between current
   * output and a pinned baseline — any drift = at least `medium`, so
   * `medium` is the default. Tighten with `high` for stability-critical
   * projects.
   */
  fail_severity: EvalSeverityEnum.default("medium"),
});

export const GiskardConfigSchema = z.object({
  enabled: z.boolean().default(true),
  /**
   * Giskard-specific scan classes. Project can opt out of specific
   * check classes (e.g., projects without bias-sensitive outputs may
   * disable `bias`).
   */
  checks: z
    .array(
      z.enum([
        "prompt-injection",
        "jailbreak",
        "harmful-output",
        "bias",
        "hallucination",
      ]),
    )
    .default(["prompt-injection", "jailbreak", "harmful-output", "bias", "hallucination"]),
  /** Severity for HIGH findings — HIGH stays HIGH per plan §5.7. */
  fail_severity: EvalSeverityEnum.default("high"),
});

/**
 * The full `eval:` section.
 */
export const EvalConfigSchema = z.object({
  targets: z.array(EvalTargetSchema).default([]),
  deepeval: DeepEvalConfigSchema.optional(),
  promptfoo: PromptfooConfigSchema.optional(),
  giskard: GiskardConfigSchema.optional(),
});

export type EvalConfig = z.infer<typeof EvalConfigSchema>;
export type EvalTarget = z.infer<typeof EvalTargetSchema>;
export type DeepEvalConfig = z.infer<typeof DeepEvalConfigSchema>;
export type PromptfooConfig = z.infer<typeof PromptfooConfigSchema>;
export type GiskardConfig = z.infer<typeof GiskardConfigSchema>;
