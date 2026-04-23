/**
 * Aggregator tests — pure function that merges N ScanResults with a
 * GatePolicy into a single AggregateResult.
 *
 * Covers:
 *   - totals rollup across scanners
 *   - overall = "pass" when no finding meets block_severity
 *   - overall = "fail" when ≥1 unwaived finding meets block_severity
 *   - waivers suppress blockers
 *   - block_severity threshold honoured at every rung
 *   - deterministic timestamp when `now` is injected
 */

import { describe, expect, it } from "vitest";
import type { ScanResult } from "../schemas/security-gate-result.schema";
import { aggregate } from "../src/security/aggregate";

function scanResult(
  scanner: string,
  findings: { id: string; severity: "critical" | "high" | "medium" | "low" | "info" }[] = [],
): ScanResult {
  const summary = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
    total: findings.length,
  };
  return {
    schema_version: 1 as const,
    scanner,
    scanned_at: "2026-04-24T15:00:00Z",
    target: ".",
    status: "success",
    findings: findings.map((f) => ({
      id: f.id,
      scanner,
      severity: f.severity,
      title: `finding ${f.id}`,
    })),
    summary,
  };
}

const FIXED_NOW = new Date("2026-04-24T15:00:00Z");

describe("aggregate — overall pass/fail", () => {
  it("pass when no findings at all", () => {
    const result = aggregate({
      scanners: [scanResult("semgrep"), scanResult("gitleaks")],
      policy: { block_severity: "high", waivers: [] },
      now: FIXED_NOW,
    });
    expect(result.overall).toBe("pass");
    expect(result.blockers).toEqual([]);
    expect(result.totals.total).toBe(0);
  });

  it("pass when all findings below block threshold", () => {
    const result = aggregate({
      scanners: [
        scanResult("semgrep", [
          { id: "a", severity: "medium" },
          { id: "b", severity: "low" },
        ]),
      ],
      policy: { block_severity: "high", waivers: [] },
      now: FIXED_NOW,
    });
    expect(result.overall).toBe("pass");
    expect(result.blockers).toEqual([]);
  });

  it("fail when ≥1 finding at block threshold", () => {
    const result = aggregate({
      scanners: [
        scanResult("semgrep", [
          { id: "a", severity: "high" },
          { id: "b", severity: "low" },
        ]),
      ],
      policy: { block_severity: "high", waivers: [] },
      now: FIXED_NOW,
    });
    expect(result.overall).toBe("fail");
    expect(result.blockers).toEqual(["a"]);
  });

  it("fail when ≥1 finding above block threshold", () => {
    const result = aggregate({
      scanners: [scanResult("osv", [{ id: "CVE-X", severity: "critical" }])],
      policy: { block_severity: "high", waivers: [] },
      now: FIXED_NOW,
    });
    expect(result.overall).toBe("fail");
    expect(result.blockers).toEqual(["CVE-X"]);
  });
});

describe("aggregate — waivers", () => {
  it("waivered finding does not block", () => {
    const result = aggregate({
      scanners: [
        scanResult("semgrep", [
          { id: "waived-a", severity: "high" },
          { id: "normal-b", severity: "medium" },
        ]),
      ],
      policy: { block_severity: "high", waivers: ["waived-a"] },
      now: FIXED_NOW,
    });
    expect(result.overall).toBe("pass");
    expect(result.blockers).toEqual([]);
  });

  it("partial waiver — unwaivered high still blocks", () => {
    const result = aggregate({
      scanners: [
        scanResult("semgrep", [
          { id: "waived-a", severity: "high" },
          { id: "unwaived-b", severity: "high" },
        ]),
      ],
      policy: { block_severity: "high", waivers: ["waived-a"] },
      now: FIXED_NOW,
    });
    expect(result.overall).toBe("fail");
    expect(result.blockers).toEqual(["unwaived-b"]);
  });
});

describe("aggregate — totals rollup across scanners", () => {
  it("sums summaries correctly", () => {
    const result = aggregate({
      scanners: [
        scanResult("semgrep", [
          { id: "s1", severity: "high" },
          { id: "s2", severity: "medium" },
        ]),
        scanResult("osv", [
          { id: "o1", severity: "critical" },
          { id: "o2", severity: "low" },
          { id: "o3", severity: "info" },
        ]),
      ],
      policy: { block_severity: "critical", waivers: [] },
      now: FIXED_NOW,
    });
    expect(result.totals).toEqual({
      critical: 1,
      high: 1,
      medium: 1,
      low: 1,
      info: 1,
      total: 5,
    });
  });
});

describe("aggregate — block_severity threshold", () => {
  const scanners = [
    scanResult("semgrep", [
      { id: "c", severity: "critical" },
      { id: "h", severity: "high" },
      { id: "m", severity: "medium" },
      { id: "l", severity: "low" },
      { id: "i", severity: "info" },
    ]),
  ];

  it("critical — only critical blocks", () => {
    const r = aggregate({
      scanners,
      policy: { block_severity: "critical", waivers: [] },
      now: FIXED_NOW,
    });
    expect(r.blockers).toEqual(["c"]);
  });

  it("high — critical + high block", () => {
    const r = aggregate({
      scanners,
      policy: { block_severity: "high", waivers: [] },
      now: FIXED_NOW,
    });
    expect(r.blockers).toEqual(["c", "h"]);
  });

  it("medium — critical + high + medium block", () => {
    const r = aggregate({
      scanners,
      policy: { block_severity: "medium", waivers: [] },
      now: FIXED_NOW,
    });
    expect(r.blockers).toEqual(["c", "h", "m"]);
  });

  it("info — everything blocks", () => {
    const r = aggregate({
      scanners,
      policy: { block_severity: "info", waivers: [] },
      now: FIXED_NOW,
    });
    expect(r.blockers).toEqual(["c", "h", "m", "l", "i"]);
  });
});

describe("aggregate — metadata", () => {
  it("deterministic aggregated_at when now is injected", () => {
    const r = aggregate({
      scanners: [scanResult("semgrep")],
      policy: { block_severity: "high", waivers: [] },
      now: FIXED_NOW,
    });
    expect(r.aggregated_at).toBe("2026-04-24T15:00:00.000Z");
  });

  it("passes policy through unchanged", () => {
    const policy = { block_severity: "critical" as const, waivers: ["x", "y"] };
    const r = aggregate({
      scanners: [scanResult("semgrep")],
      policy,
      now: FIXED_NOW,
    });
    expect(r.policy).toEqual(policy);
  });

  it("accepts optional project_slug", () => {
    const r = aggregate({
      scanners: [scanResult("semgrep")],
      policy: { block_severity: "high", waivers: [] },
      project_slug: "my-proj",
      now: FIXED_NOW,
    });
    expect(r.project_slug).toBe("my-proj");
  });
});
