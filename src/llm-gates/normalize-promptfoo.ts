/**
 * Promptfoo → ScanResult normalizer (§5.6).
 *
 * Promptfoo's `promptfoo eval --output json` shape:
 *
 *   {
 *     "results": {
 *       "stats": { "successes": 10, "failures": 2, "tokenUsage": { ... } },
 *       "results": [
 *         {
 *           "success": false,
 *           "score": 0.3,
 *           "namedScores": { "similarity": 0.3 },
 *           "prompt": { "raw": "...", "label": "p0" },
 *           "provider": { "id": "openai:gpt-4o" },
 *           "vars": { ... },
 *           "response": { "output": "..." },
 *           "gradingResult": {
 *             "pass": false,
 *             "reason": "Output diverged from golden by 30%"
 *           }
 *         }
 *       ]
 *     },
 *     "config": { ... },
 *     "shareableUrl": null
 *   }
 *
 * Pure function; takes parsed JSON, returns a ScanResult.
 */

import {
  type Finding,
  type ScanResult,
  type Severity,
  type SeverityCounts,
} from "../../schemas/security-gate-result.schema.js";

export interface PromptfooGradingResult {
  pass?: boolean;
  reason?: string;
}

export interface PromptfooResultRow {
  success?: boolean;
  score?: number;
  prompt?: { raw?: string; label?: string };
  provider?: { id?: string };
  response?: { output?: string };
  gradingResult?: PromptfooGradingResult;
}

export interface PromptfooRawOutput {
  results?: {
    stats?: { successes?: number; failures?: number };
    results?: PromptfooResultRow[];
  };
}

export interface NormalizeOptions {
  target: string;
  failSeverity: Severity;
  scannedAt?: string;
  scannerVersion?: string;
}

export function normalizePromptfoo(
  raw: PromptfooRawOutput,
  options: NormalizeOptions,
): ScanResult {
  const findings: Finding[] = [];
  const rows = raw.results?.results ?? [];

  rows.forEach((row, idx) => {
    if (row.success === true) return;
    const label = row.prompt?.label ?? `row-${idx}`;
    const provider = row.provider?.id ?? "unknown-provider";
    const reason =
      row.gradingResult?.reason ??
      (typeof row.score === "number"
        ? `score ${row.score.toFixed(3)} below threshold`
        : "prompt regression detected");
    findings.push({
      id: `promptfoo.${provider}.${label}`,
      scanner: "promptfoo",
      severity: options.failSeverity,
      title: `Prompt regression: ${label} on ${provider}`,
      description: reason,
    });
  });

  return {
    schema_version: 1,
    scanner: "promptfoo",
    scanner_version: options.scannerVersion,
    scanned_at: options.scannedAt ?? new Date().toISOString(),
    target: options.target,
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
