/**
 * Zod schema tests for the security-gate result contract (§5.1).
 *
 * Covers the SeverityCounts total-vs-sum invariant, Finding shape,
 * ScanResult happy/sad paths, AggregateResult assembly.
 */

import { describe, expect, it } from "vitest";
import {
  AggregateResultSchema,
  FindingSchema,
  GatePolicySchema,
  SEVERITY_RANK,
  ScanResultSchema,
  SeverityCountsSchema,
  SeverityEnum,
  meetsThreshold,
} from "../schemas/security-gate-result.schema";

describe("SeverityEnum", () => {
  it("accepts the 5 canonical rungs", () => {
    for (const rung of ["critical", "high", "medium", "low", "info"]) {
      expect(SeverityEnum.safeParse(rung).success).toBe(true);
    }
  });
  it("rejects unknown severities", () => {
    expect(SeverityEnum.safeParse("urgent").success).toBe(false);
    expect(SeverityEnum.safeParse("moderate").success).toBe(false);
  });
});

describe("SeverityCountsSchema — total must equal bucket sum", () => {
  it("accepts consistent counts", () => {
    expect(
      SeverityCountsSchema.safeParse({
        critical: 1,
        high: 2,
        medium: 3,
        low: 4,
        info: 5,
        total: 15,
      }).success,
    ).toBe(true);
  });

  it("rejects inconsistent total", () => {
    expect(
      SeverityCountsSchema.safeParse({
        critical: 1,
        high: 2,
        medium: 3,
        low: 4,
        info: 5,
        total: 99,
      }).success,
    ).toBe(false);
  });

  it("rejects negative counts", () => {
    expect(
      SeverityCountsSchema.safeParse({
        critical: -1,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
        total: -1,
      }).success,
    ).toBe(false);
  });
});

describe("FindingSchema", () => {
  const base = {
    id: "semgrep.rule",
    scanner: "semgrep",
    severity: "high" as const,
    title: "issue",
  };

  it("accepts a minimal finding", () => {
    expect(FindingSchema.safeParse(base).success).toBe(true);
  });

  it("accepts a finding with location + cwe", () => {
    expect(
      FindingSchema.safeParse({
        ...base,
        file: "src/app.ts",
        line: 42,
        column: 8,
        cwe: "CWE-79",
      }).success,
    ).toBe(true);
  });

  it("rejects zero line numbers", () => {
    expect(
      FindingSchema.safeParse({ ...base, line: 0 }).success,
    ).toBe(false);
  });

  it("rejects invalid severity enum", () => {
    expect(
      FindingSchema.safeParse({ ...base, severity: "urgent" }).success,
    ).toBe(false);
  });

  it("rejects empty id / scanner / title", () => {
    expect(FindingSchema.safeParse({ ...base, id: "" }).success).toBe(false);
    expect(FindingSchema.safeParse({ ...base, scanner: "" }).success).toBe(false);
    expect(FindingSchema.safeParse({ ...base, title: "" }).success).toBe(false);
  });
});

describe("ScanResultSchema", () => {
  const validResult = {
    schema_version: 1 as const,
    scanner: "semgrep",
    scanned_at: "2026-04-24T15:00:00Z",
    target: ".",
    status: "success" as const,
    findings: [],
    summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 },
  };

  it("accepts a well-formed clean scan", () => {
    expect(ScanResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("rejects non-ISO scanned_at", () => {
    expect(
      ScanResultSchema.safeParse({ ...validResult, scanned_at: "yesterday" })
        .success,
    ).toBe(false);
  });

  it("rejects schema_version != 1", () => {
    expect(
      ScanResultSchema.safeParse({ ...validResult, schema_version: 2 })
        .success,
    ).toBe(false);
  });

  it("accepts a scan with findings when summary agrees", () => {
    expect(
      ScanResultSchema.safeParse({
        ...validResult,
        findings: [
          {
            id: "a",
            scanner: "semgrep",
            severity: "high",
            title: "x",
          },
        ],
        summary: { critical: 0, high: 1, medium: 0, low: 0, info: 0, total: 1 },
      }).success,
    ).toBe(true);
  });
});

describe("GatePolicySchema", () => {
  it("fills sensible defaults", () => {
    const parsed = GatePolicySchema.parse({});
    expect(parsed.block_severity).toBe("high");
    expect(parsed.waivers).toEqual([]);
  });

  it("accepts explicit overrides", () => {
    const parsed = GatePolicySchema.parse({
      block_severity: "critical",
      waivers: ["id-a", "id-b"],
    });
    expect(parsed.block_severity).toBe("critical");
    expect(parsed.waivers).toEqual(["id-a", "id-b"]);
  });
});

describe("AggregateResultSchema", () => {
  const validScan = {
    schema_version: 1 as const,
    scanner: "semgrep",
    scanned_at: "2026-04-24T15:00:00Z",
    target: ".",
    status: "success" as const,
    findings: [],
    summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 },
  };

  it("accepts a well-formed pass aggregate", () => {
    expect(
      AggregateResultSchema.safeParse({
        schema_version: 1,
        aggregated_at: "2026-04-24T15:00:00Z",
        scanners: [validScan],
        totals: { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 },
        overall: "pass",
        blockers: [],
        policy: { block_severity: "high", waivers: [] },
      }).success,
    ).toBe(true);
  });

  it("rejects zero scanners", () => {
    expect(
      AggregateResultSchema.safeParse({
        schema_version: 1,
        aggregated_at: "2026-04-24T15:00:00Z",
        scanners: [],
        totals: { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 },
        overall: "pass",
        blockers: [],
        policy: { block_severity: "high", waivers: [] },
      }).success,
    ).toBe(false);
  });
});

describe("meetsThreshold", () => {
  it("ranks severities strictly", () => {
    expect(SEVERITY_RANK.info).toBe(0);
    expect(SEVERITY_RANK.critical).toBe(4);
  });

  it("returns true when finding meets or exceeds threshold", () => {
    expect(meetsThreshold("high", "high")).toBe(true);
    expect(meetsThreshold("critical", "high")).toBe(true);
    expect(meetsThreshold("medium", "high")).toBe(false);
    expect(meetsThreshold("info", "info")).toBe(true);
  });
});
