/**
 * Security-gate result schema.
 *
 * Normalised shape for the 5-scanner classical security stack (§5.1):
 * Semgrep / Gitleaks / Trivy / OSV-Scanner / Syft.
 *
 * Each scanner wrapper emits a `ScanResult` at
 * `_context/audit/security/<scanner>-<date>.json`.
 * The aggregator (`aggregate-gate-results`) merges N ScanResults into
 * an `AggregateResult` the Phase-7 gate consumes as a single
 * acceptance_check outcome.
 */

import { z } from "zod";

/**
 * Severity ladder. Scanners emit wildly different severity vocabularies —
 * every wrapper must map its native scale onto this 5-rung ladder.
 */
export const SeverityEnum = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "info",
]);

export type Severity = z.infer<typeof SeverityEnum>;

/**
 * Severity-count histogram. Every ScanResult + AggregateResult carries one.
 * `total` MUST equal the sum of the other five fields (invariant enforced
 * by .refine() — keeps call-sites from hand-summing incorrectly).
 */
export const SeverityCountsSchema = z
  .object({
    critical: z.number().int().min(0),
    high: z.number().int().min(0),
    medium: z.number().int().min(0),
    low: z.number().int().min(0),
    info: z.number().int().min(0),
    total: z.number().int().min(0),
  })
  .refine(
    (c) => c.critical + c.high + c.medium + c.low + c.info === c.total,
    { message: "total must equal sum of severity buckets" },
  );

export type SeverityCounts = z.infer<typeof SeverityCountsSchema>;

/**
 * A single finding. `raw` preserves the scanner's native payload for audit —
 * consumers MUST NOT rely on its shape; treat everything outside the typed
 * fields as opaque.
 */
export const FindingSchema = z.object({
  id: z.string().min(1),
  scanner: z.string().min(1),
  severity: SeverityEnum,
  title: z.string().min(1),
  description: z.string().optional(),
  file: z.string().optional(),
  line: z.number().int().positive().optional(),
  column: z.number().int().positive().optional(),
  rule_url: z.string().url().optional(),
  cwe: z.string().optional(),
  cve: z.string().optional(),
  remediation: z.string().optional(),
  raw: z.unknown().optional(),
});

export type Finding = z.infer<typeof FindingSchema>;

/**
 * Per-scanner result. One of these per scanner run, written to
 * `_context/audit/security/<scanner>-<date>.json`.
 */
export const ScanResultSchema = z.object({
  schema_version: z.literal(1),
  scanner: z.string().min(1),
  scanner_version: z.string().optional(),
  scanned_at: z.string().datetime(),
  target: z.string().min(1),
  duration_ms: z.number().int().nonnegative().optional(),
  status: z.enum(["success", "error", "skipped"]),
  error_message: z.string().optional(),
  findings: z.array(FindingSchema),
  summary: SeverityCountsSchema,
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

/**
 * Gate policy — which severity blocks the transition, and which finding ids
 * are explicitly waived.
 *
 * Waivers let a human approver sign off on a specific finding without
 * invalidating the whole gate. Waiver records live in
 * `.coldpress/signoffs/security-gate/<finding-id>.yaml`; the aggregator
 * loads them and populates `policy.waivers[]` at aggregate-time.
 */
export const GatePolicySchema = z.object({
  block_severity: SeverityEnum.default("high"),
  waivers: z.array(z.string()).default([]),
});

export type GatePolicy = z.infer<typeof GatePolicySchema>;

/**
 * Aggregated result — the thing the phase-gate evaluator consumes.
 *
 * overall:
 *   "pass" — no unwaived findings at-or-above block_severity
 *   "fail" — ≥1 unwaived finding at-or-above block_severity
 *
 * blockers[] — finding ids that pushed overall to "fail".
 */
export const AggregateResultSchema = z.object({
  schema_version: z.literal(1),
  aggregated_at: z.string().datetime(),
  project_slug: z.string().optional(),
  scanners: z.array(ScanResultSchema).min(1),
  totals: SeverityCountsSchema,
  overall: z.enum(["pass", "fail"]),
  blockers: z.array(z.string()),
  policy: GatePolicySchema,
});

export type AggregateResult = z.infer<typeof AggregateResultSchema>;

/**
 * Severity rank — used to compare a finding's severity to policy.block_severity.
 * Higher rank = more severe.
 */
export const SEVERITY_RANK: Record<Severity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

/** Returns true when `finding` ≥ `threshold` on the severity ladder. */
export function meetsThreshold(
  finding: Severity,
  threshold: Severity,
): boolean {
  return SEVERITY_RANK[finding] >= SEVERITY_RANK[threshold];
}
