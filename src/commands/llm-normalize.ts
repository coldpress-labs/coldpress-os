/**
 * `coldpress llm-normalize <tool> <raw-file>` (WS11 S4) — the CLI seam that makes
 * the `src/llm-gates/` normalizers reachable. They convert a native LLM-eval tool's
 * output (DeepEval / Giskard / Promptfoo) into the canonical `ScanResult` the
 * security aggregator (`coldpress security aggregate`) consumes — but nothing could
 * invoke them, so `verify_pack: llm-app` (which names `normalizers: [deepeval,
 * promptfoo, giskard]`) and the Phase-9 LLM gate skills had no code path to the
 * normalization they describe. This exposes them so those skills can normalize
 * real tool output instead of hand-waving it.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { normalizeDeepEval, type DeepEvalRawOutput } from "../llm-gates/normalize-deepeval.js";
import { normalizeGiskard, type GiskardRawOutput } from "../llm-gates/normalize-giskard.js";
import { normalizePromptfoo, type PromptfooRawOutput } from "../llm-gates/normalize-promptfoo.js";
import type { ScanResult } from "../../schemas/security-gate-result.schema.js";

export const LLM_NORMALIZE_TOOLS = ["deepeval", "giskard", "promptfoo"] as const;
export type LlmNormalizeTool = (typeof LLM_NORMALIZE_TOOLS)[number];

const VALID_SEVERITIES = new Set(["critical", "high", "medium", "low", "info"]);

export function runLlmNormalize(
  tool: string,
  rawFile: string,
  opts: { target?: string; failSeverity?: string; out?: string },
): number {
  if (!(LLM_NORMALIZE_TOOLS as readonly string[]).includes(tool)) {
    process.stderr.write(`llm-normalize: unknown tool "${tool}" (expected ${LLM_NORMALIZE_TOOLS.join(" | ")}).\n`);
    return 1;
  }
  const target = opts.target ?? "llm-app";
  const failSeverity = (opts.failSeverity ?? "high") as ScanResult["findings"][number]["severity"];
  if (!VALID_SEVERITIES.has(failSeverity)) {
    process.stderr.write(`llm-normalize: invalid --fail-severity "${failSeverity}" (expected ${[...VALID_SEVERITIES].join(" | ")}).\n`);
    return 1;
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(rawFile, "utf8"));
  } catch (e) {
    process.stderr.write(`llm-normalize: cannot read/parse ${rawFile}: ${e instanceof Error ? e.message : String(e)}\n`);
    return 1;
  }

  const options = { target, failSeverity };
  let result: ScanResult;
  switch (tool as LlmNormalizeTool) {
    case "deepeval":
      result = normalizeDeepEval(raw as DeepEvalRawOutput, options);
      break;
    case "giskard":
      result = normalizeGiskard(raw as GiskardRawOutput, options);
      break;
    case "promptfoo":
      result = normalizePromptfoo(raw as PromptfooRawOutput, options);
      break;
  }

  const json = JSON.stringify(result, null, 2) + "\n";
  if (opts.out) {
    writeFileSync(opts.out, json);
    process.stdout.write(`llm-normalize: wrote ${result.findings.length} finding(s) → ${opts.out}\n`);
  } else {
    process.stdout.write(json);
  }
  // A normalizer is not a gate — it always exits 0 on successful normalization.
  // The findings' severities drive the downstream security aggregator's verdict.
  return 0;
}
