/**
 * LLM-gate normalizer tests (§5.5–§5.7).
 *
 * Exercises each normalizer against hand-authored fixture JSON matching
 * the tool's documented output shape. Covers:
 *   - empty input → zero findings
 *   - happy-path failures map to ScanResult shape
 *   - severity mapping per tool (DeepEval fail_severity passthrough,
 *     Promptfoo fail_severity passthrough, Giskard level → ladder +
 *     floor semantics)
 *   - edge cases (unknown levels, missing fields)
 *
 * Each ScanResult output is round-tripped through ScanResultSchema to
 * verify contract compliance.
 */

import { describe, expect, it } from "vitest";
import { EvalConfigSchema, EvalTargetSchema } from "../schemas/eval-config.schema";
import { ScanResultSchema } from "../schemas/security-gate-result.schema";
import { normalizeDeepEval } from "../src/llm-gates/normalize-deepeval";
import { normalizeGiskard } from "../src/llm-gates/normalize-giskard";
import { normalizePromptfoo } from "../src/llm-gates/normalize-promptfoo";

const FIXED_NOW = "2026-04-24T15:00:00.000Z";

describe("EvalConfigSchema", () => {
  it("accepts an empty config (all sub-blocks optional)", () => {
    const parsed = EvalConfigSchema.parse({});
    expect(parsed.targets).toEqual([]);
    expect(parsed.deepeval).toBeUndefined();
    expect(parsed.promptfoo).toBeUndefined();
    expect(parsed.giskard).toBeUndefined();
  });

  it("fills DeepEval defaults when the block is present", () => {
    const parsed = EvalConfigSchema.parse({ deepeval: {} });
    expect(parsed.deepeval?.enabled).toBe(true);
    expect(parsed.deepeval?.metrics).toEqual([
      "faithfulness",
      "hallucination",
      "g_eval",
      "answer_relevancy",
    ]);
    expect(parsed.deepeval?.fail_severity).toBe("high");
  });

  it("fills Promptfoo defaults", () => {
    const parsed = EvalConfigSchema.parse({ promptfoo: {} });
    expect(parsed.promptfoo?.config_path).toBe("promptfooconfig.yaml");
    expect(parsed.promptfoo?.fail_severity).toBe("medium");
  });

  it("fills Giskard defaults (five checks)", () => {
    const parsed = EvalConfigSchema.parse({ giskard: {} });
    expect(parsed.giskard?.checks).toEqual([
      "prompt-injection",
      "jailbreak",
      "harmful-output",
      "bias",
      "hallucination",
    ]);
    expect(parsed.giskard?.fail_severity).toBe("high");
  });

  it("rejects targets with non-slug ids", () => {
    expect(
      EvalTargetSchema.safeParse({
        id: "Bad ID!",
        prompt_ref: "x",
      }).success,
    ).toBe(false);
  });

  it("rejects unknown Giskard check", () => {
    expect(
      EvalConfigSchema.safeParse({
        giskard: { checks: ["prompt-injection", "unknown-check"] },
      }).success,
    ).toBe(false);
  });
});

describe("normalizeDeepEval", () => {
  it("handles empty output → zero findings", () => {
    const result = normalizeDeepEval(
      {},
      { target: "agent", failSeverity: "high", scannedAt: FIXED_NOW },
    );
    expect(result.scanner).toBe("deepeval");
    expect(result.findings).toEqual([]);
    expect(result.summary.total).toBe(0);
    expect(ScanResultSchema.safeParse(result).success).toBe(true);
  });

  it("maps each failing metric to a finding at configured severity", () => {
    const result = normalizeDeepEval(
      {
        test_cases: [
          {
            name: "test_faithfulness_0",
            metrics: [
              {
                name: "faithfulness",
                score: 0.72,
                threshold: 0.8,
                success: false,
                reason: "model produced an unsupported claim",
              },
              {
                name: "hallucination",
                score: 0.2,
                threshold: 0.1,
                success: true,
              },
            ],
          },
        ],
        run_duration: 12.5,
      },
      { target: "triage", failSeverity: "high", scannedAt: FIXED_NOW },
    );
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      id: "deepeval.faithfulness.test_faithfulness_0",
      scanner: "deepeval",
      severity: "high",
      description: "model produced an unsupported claim",
    });
    expect(result.duration_ms).toBe(12500);
    expect(result.summary).toEqual({
      critical: 0,
      high: 1,
      medium: 0,
      low: 0,
      info: 0,
      total: 1,
    });
    expect(ScanResultSchema.safeParse(result).success).toBe(true);
  });

  it("respects fail_severity config override", () => {
    const result = normalizeDeepEval(
      {
        test_cases: [
          {
            name: "t",
            metrics: [{ name: "faithfulness", success: false }],
          },
        ],
      },
      { target: "t", failSeverity: "medium", scannedAt: FIXED_NOW },
    );
    expect(result.findings[0]!.severity).toBe("medium");
  });

  it("synthesises a description when metric.reason is missing", () => {
    const result = normalizeDeepEval(
      {
        test_cases: [
          {
            name: "t",
            metrics: [
              {
                name: "g_eval",
                score: 0.4,
                threshold: 0.9,
                success: false,
              },
            ],
          },
        ],
      },
      { target: "t", failSeverity: "high", scannedAt: FIXED_NOW },
    );
    expect(result.findings[0]!.description).toContain("0.400");
    expect(result.findings[0]!.description).toContain("0.900");
  });
});

describe("normalizePromptfoo", () => {
  it("handles empty output → zero findings", () => {
    const result = normalizePromptfoo(
      {},
      { target: "project", failSeverity: "medium", scannedAt: FIXED_NOW },
    );
    expect(result.scanner).toBe("promptfoo");
    expect(result.findings).toEqual([]);
    expect(ScanResultSchema.safeParse(result).success).toBe(true);
  });

  it("skips successful rows, emits findings for failing rows", () => {
    const result = normalizePromptfoo(
      {
        results: {
          results: [
            { success: true, prompt: { label: "p0" }, provider: { id: "openai:gpt-4o" } },
            {
              success: false,
              score: 0.3,
              prompt: { label: "p1" },
              provider: { id: "openai:gpt-4o" },
              gradingResult: {
                pass: false,
                reason: "Output diverged from golden by 30%",
              },
            },
          ],
        },
      },
      { target: "project", failSeverity: "medium", scannedAt: FIXED_NOW },
    );
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      id: "promptfoo.openai:gpt-4o.p1",
      scanner: "promptfoo",
      severity: "medium",
      title: "Prompt regression: p1 on openai:gpt-4o",
      description: "Output diverged from golden by 30%",
    });
    expect(ScanResultSchema.safeParse(result).success).toBe(true);
  });

  it("falls back to row index when label is missing", () => {
    const result = normalizePromptfoo(
      {
        results: {
          results: [
            {
              success: false,
              provider: { id: "anthropic:claude" },
            },
          ],
        },
      },
      { target: "project", failSeverity: "medium", scannedAt: FIXED_NOW },
    );
    expect(result.findings[0]!.id).toBe("promptfoo.anthropic:claude.row-0");
  });

  it("uses score in description when gradingResult.reason is absent", () => {
    const result = normalizePromptfoo(
      {
        results: {
          results: [
            {
              success: false,
              score: 0.25,
              prompt: { label: "p0" },
              provider: { id: "p" },
            },
          ],
        },
      },
      { target: "project", failSeverity: "medium", scannedAt: FIXED_NOW },
    );
    expect(result.findings[0]!.description).toContain("0.250");
  });
});

describe("normalizeGiskard", () => {
  it("handles empty output → zero findings", () => {
    const result = normalizeGiskard(
      {},
      { target: "agent", failSeverity: "high", scannedAt: FIXED_NOW },
    );
    expect(result.scanner).toBe("giskard");
    expect(result.findings).toEqual([]);
    expect(ScanResultSchema.safeParse(result).success).toBe(true);
  });

  it("maps native levels to the 5-rung ladder", () => {
    const result = normalizeGiskard(
      {
        issues: [
          {
            group: "prompt-injection",
            level: "major",
            title: "System prompt leak via crafted input",
            detector: "InjectionProbe",
          },
          {
            group: "bias",
            level: "medium",
            title: "Demographic skew in outputs",
            detector: "BiasProbe",
          },
          {
            group: "hallucination",
            level: "minor",
            title: "Minor factual drift",
            detector: "HallucinationProbe",
          },
        ],
        model: { name: "triage-agent" },
        duration_seconds: 42.5,
      },
      { target: "triage-agent", failSeverity: "info", scannedAt: FIXED_NOW },
    );

    expect(result.target).toBe("triage-agent");
    expect(result.duration_ms).toBe(42500);
    expect(result.findings).toHaveLength(3);

    const bySeverity = result.findings.map((f) => ({
      id: f.id,
      severity: f.severity,
    }));
    expect(bySeverity).toEqual([
      { id: "giskard.prompt-injection.InjectionProbe", severity: "high" },
      { id: "giskard.bias.BiasProbe", severity: "medium" },
      { id: "giskard.hallucination.HallucinationProbe", severity: "low" },
    ]);
    expect(ScanResultSchema.safeParse(result).success).toBe(true);
  });

  it("applies fail_severity as a FLOOR — raises below, preserves above", () => {
    const result = normalizeGiskard(
      {
        issues: [
          { group: "g", level: "major", title: "major", detector: "d1" },
          { group: "g", level: "minor", title: "minor", detector: "d2" },
        ],
      },
      { target: "x", failSeverity: "medium", scannedAt: FIXED_NOW },
    );
    // major → high (above floor medium, unchanged)
    expect(result.findings[0]!.severity).toBe("high");
    // minor → low, but raised to floor medium
    expect(result.findings[1]!.severity).toBe("medium");
  });

  it("floor critical raises EVERYTHING to critical", () => {
    const result = normalizeGiskard(
      {
        issues: [
          { group: "g", level: "major", title: "a", detector: "d1" },
          { group: "g", level: "minor", title: "b", detector: "d2" },
        ],
      },
      { target: "x", failSeverity: "critical", scannedAt: FIXED_NOW },
    );
    expect(result.findings.every((f) => f.severity === "critical")).toBe(true);
  });

  it("maps unknown level to info, then applies floor", () => {
    const result = normalizeGiskard(
      {
        issues: [{ group: "g", level: "weird", title: "t", detector: "d" }],
      },
      { target: "x", failSeverity: "low", scannedAt: FIXED_NOW },
    );
    expect(result.findings[0]!.severity).toBe("low");
  });

  it("falls back to target when model.name is absent", () => {
    const result = normalizeGiskard(
      {
        issues: [{ group: "g", level: "major", title: "t", detector: "d" }],
      },
      { target: "fallback-target", failSeverity: "high", scannedAt: FIXED_NOW },
    );
    expect(result.target).toBe("fallback-target");
  });
});
