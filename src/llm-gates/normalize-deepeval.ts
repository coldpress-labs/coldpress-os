/**
 * DeepEval → ScanResult normalizer (§5.5).
 *
 * DeepEval's JSON output (from `deepeval test run --format json`) shape:
 *
 *   {
 *     "test_cases": [
 *       {
 *         "name": "test_faithfulness_0",
 *         "metrics": [
 *           {
 *             "name": "faithfulness",
 *             "score": 0.72,
 *             "threshold": 0.8,
 *             "success": false,
 *             "reason": "model produced an unsupported claim about X",
 *             "cost": 0.02
 *           }
 *         ],
 *         "input": "...",
 *         "actual_output": "...",
 *         "expected_output": "..."
 *       }
 *     ],
 *     "run_duration": 12.3,
 *     "timestamp": "2026-04-24T15:00:00"
 *   }
 *
 * Pure function; takes parsed JSON, returns a ScanResult. Unit-testable
 * with fixture strings regardless of DeepEval install state.
 */

import {
  type Finding,
  type ScanResult,
  type Severity,
  type SeverityCounts,
} from "../../schemas/security-gate-result.schema.js";

export interface DeepEvalMetric {
  name?: string;
  score?: number;
  threshold?: number;
  success?: boolean;
  reason?: string;
}

export interface DeepEvalTestCase {
  name?: string;
  metrics?: DeepEvalMetric[];
  input?: string;
  actual_output?: string;
}

export interface DeepEvalRawOutput {
  test_cases?: DeepEvalTestCase[];
  run_duration?: number;
  timestamp?: string;
}

export interface NormalizeOptions {
  target: string;
  failSeverity: Severity;
  scannedAt?: string;
  scannerVersion?: string;
}

export function normalizeDeepEval(
  raw: DeepEvalRawOutput,
  options: NormalizeOptions,
): ScanResult {
  const findings: Finding[] = [];
  const testCases = raw.test_cases ?? [];

  for (const tc of testCases) {
    for (const metric of tc.metrics ?? []) {
      if (metric.success === false) {
        const metricName = metric.name ?? "unknown-metric";
        const testName = tc.name ?? "unknown-test";
        const score = typeof metric.score === "number" ? metric.score.toFixed(3) : "?";
        const threshold =
          typeof metric.threshold === "number" ? metric.threshold.toFixed(3) : "?";
        findings.push({
          id: `deepeval.${metricName}.${testName}`,
          scanner: "deepeval",
          severity: options.failSeverity,
          title: `DeepEval ${metricName} failed for ${testName}`,
          description:
            metric.reason ?? `score ${score} below threshold ${threshold}`,
        });
      }
    }
  }

  return {
    schema_version: 1,
    scanner: "deepeval",
    scanner_version: options.scannerVersion,
    scanned_at: options.scannedAt ?? new Date().toISOString(),
    target: options.target,
    duration_ms:
      typeof raw.run_duration === "number"
        ? Math.round(raw.run_duration * 1000)
        : undefined,
    status: "success",
    findings,
    summary: summaryFromFindings(findings),
  };
}

function summaryFromFindings(findings: Finding[]): SeverityCounts {
  const s: SeverityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    total: findings.length,
  };
  for (const f of findings) s[f.severity]++;
  return s;
}
