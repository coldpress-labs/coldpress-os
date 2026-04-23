/**
 * Security-gate aggregator — pure function that merges N ScanResults
 * into a single AggregateResult.
 *
 * Policy:
 *   - block_severity (default "high") sets the fail threshold
 *   - waivers[] (finding ids from `.coldpress/signoffs/security-gate/`)
 *     are excluded from blockers[]
 *   - overall: "fail" iff ≥1 unwaived finding at-or-above block_severity
 *
 * Does NOT read disk; caller assembles ScanResult[] and GatePolicy.
 */

import {
  type AggregateResult,
  type GatePolicy,
  type ScanResult,
  type SeverityCounts,
  meetsThreshold,
} from "../../schemas/security-gate-result.schema.js";

export interface AggregateInput {
  scanners: ScanResult[];
  policy: GatePolicy;
  project_slug?: string;
  /** Injected to keep `aggregated_at` deterministic in tests. */
  now?: Date;
}

function emptyCounts(): SeverityCounts {
  return { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 };
}

function sumCounts(a: SeverityCounts, b: SeverityCounts): SeverityCounts {
  return {
    critical: a.critical + b.critical,
    high: a.high + b.high,
    medium: a.medium + b.medium,
    low: a.low + b.low,
    info: a.info + b.info,
    total: a.total + b.total,
  };
}

export function aggregate(input: AggregateInput): AggregateResult {
  const totals = input.scanners.reduce<SeverityCounts>(
    (acc, s) => sumCounts(acc, s.summary),
    emptyCounts(),
  );

  const waiverSet = new Set(input.policy.waivers);
  const threshold = input.policy.block_severity;

  const blockers: string[] = [];
  for (const scanner of input.scanners) {
    for (const f of scanner.findings) {
      if (meetsThreshold(f.severity, threshold) && !waiverSet.has(f.id)) {
        blockers.push(f.id);
      }
    }
  }

  return {
    schema_version: 1 as const,
    aggregated_at: (input.now ?? new Date()).toISOString(),
    project_slug: input.project_slug,
    scanners: input.scanners,
    totals,
    overall: blockers.length === 0 ? "pass" : "fail",
    blockers,
    policy: input.policy,
  };
}
