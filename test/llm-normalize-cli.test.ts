/**
 * WS11 S4 — the `coldpress llm-normalize` verb makes the src/llm-gates/
 * normalizers reachable (they were tested-but-unreachable; verify_pack: llm-app
 * named them with no code path). Exercises the CLI seam end-to-end via --out.
 */

import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runLlmNormalize } from "../src/commands/llm-normalize";
import { ScanResultSchema } from "../schemas/security-gate-result.schema";

let work: string;
beforeEach(() => {
  work = mkdtempSync(join(tmpdir(), "cp-llm-normalize-"));
});
afterEach(() => rmSync(work, { recursive: true, force: true }));

describe("coldpress llm-normalize", () => {
  it("normalizes DeepEval output → a schema-valid ScanResult with a finding per failing metric", () => {
    const raw = join(work, "deepeval.json");
    const out = join(work, "result.json");
    writeFileSync(
      raw,
      JSON.stringify({
        test_cases: [
          { name: "faithfulness-check", metrics: [{ name: "faithfulness", success: false, score: 0.42, threshold: 0.8 }] },
          { name: "relevancy-check", metrics: [{ name: "relevancy", success: true, score: 0.95, threshold: 0.8 }] },
        ],
      }),
    );
    const code = runLlmNormalize("deepeval", raw, { target: "my-assistant", failSeverity: "high", out });
    expect(code).toBe(0);
    const result = JSON.parse(readFileSync(out, "utf8"));
    expect(ScanResultSchema.safeParse(result).success).toBe(true);
    expect(result.scanner).toBe("deepeval");
    expect(result.target).toBe("my-assistant");
    expect(result.findings).toHaveLength(1); // only the failing metric
    expect(result.findings[0].severity).toBe("high");
  });

  it("rejects an unknown tool", () => {
    const raw = join(work, "x.json");
    writeFileSync(raw, "{}");
    expect(runLlmNormalize("not-a-tool", raw, {})).toBe(1);
  });

  it("rejects an invalid --fail-severity", () => {
    const raw = join(work, "x.json");
    writeFileSync(raw, JSON.stringify({ test_cases: [] }));
    expect(runLlmNormalize("deepeval", raw, { failSeverity: "catastrophic" })).toBe(1);
  });

  it("fails cleanly on an unreadable raw file", () => {
    expect(runLlmNormalize("giskard", join(work, "missing.json"), {})).toBe(1);
  });
});
