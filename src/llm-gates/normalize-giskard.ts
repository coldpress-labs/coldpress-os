/**
 * Giskard → ScanResult normalizer (§5.7).
 *
 * Giskard's `giskard scan --format json` shape (LLM adversarial report):
 *
 *   {
 *     "issues": [
 *       {
 *         "group": "prompt-injection",
 *         "level": "major",
 *         "title": "Model leaks system prompt on crafted input",
 *         "description": "...",
 *         "detector": "InjectionProbe",
 *         "examples": [ ... ]
 *       }
 *     ],
 *     "model": { "name": "my-agent", "type": "llm" },
 *     "duration_seconds": 42.5
 *   }
 *
 * Giskard's `level` vocabulary (`major` / `medium` / `minor`) maps to
 * our 5-rung ladder:
 *   - major  → high
 *   - medium → medium
 *   - minor  → low
 *   - (unknown) → info
 *
 * HIGH-severity findings block the Phase-7 gate at §5.1's default
 * block_severity. `fail_severity` from config is applied as a FLOOR
 * (never downgrades Giskard's own severity), so tightening the config
 * elevates minor findings but relaxing it doesn't downgrade major ones.
 */

import {
  SEVERITY_RANK,
  type Finding,
  type ScanResult,
  type Severity,
  type SeverityCounts,
} from "../../schemas/security-gate-result.schema.js";

export interface GiskardIssue {
  group?: string;
  level?: string;
  title?: string;
  description?: string;
  detector?: string;
}

export interface GiskardRawOutput {
  issues?: GiskardIssue[];
  model?: { name?: string };
  duration_seconds?: number;
}

export interface NormalizeOptions {
  target: string;
  /**
   * Severity floor from `coldpress.yaml` `eval.giskard.fail_severity`.
   * Issues whose native severity ranks below this are raised to match.
   * Issues above keep their native rank.
   */
  failSeverity: Severity;
  scannedAt?: string;
  scannerVersion?: string;
}

const GISKARD_LEVEL_MAP: Record<string, Severity> = {
  major: "high",
  medium: "medium",
  minor: "low",
};

export function normalizeGiskard(
  raw: GiskardRawOutput,
  options: NormalizeOptions,
): ScanResult {
  const findings: Finding[] = [];
  const issues = raw.issues ?? [];
  const modelName = raw.model?.name ?? options.target;

  issues.forEach((issue, idx) => {
    const nativeSev = mapLevel(issue.level);
    const severity = applyFloor(nativeSev, options.failSeverity);
    const group = issue.group ?? "uncategorized";
    const detector = issue.detector ?? `issue-${idx}`;
    findings.push({
      id: `giskard.${group}.${detector}`,
      scanner: "giskard",
      severity,
      title: issue.title ?? `Giskard ${group} issue`,
      description: issue.description,
    });
  });

  return {
    schema_version: 1,
    scanner: "giskard",
    scanner_version: options.scannerVersion,
    scanned_at: options.scannedAt ?? new Date().toISOString(),
    target: modelName,
    duration_ms:
      typeof raw.duration_seconds === "number"
        ? Math.round(raw.duration_seconds * 1000)
        : undefined,
    status: "success",
    findings,
    summary: summaryFromFindings(findings),
  };
}

function mapLevel(level: string | undefined): Severity {
  if (!level) return "info";
  return GISKARD_LEVEL_MAP[level.toLowerCase()] ?? "info";
}

function applyFloor(native: Severity, floor: Severity): Severity {
  return SEVERITY_RANK[native] >= SEVERITY_RANK[floor] ? native : floor;
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
