---
name: security-gate
description: Phase-7 classical security gate — 5 scanner wrappers + normalised schema + pure-function aggregator wired as a phase-gate acceptance_check
version: "1.0"
---

# Security Gate (§5.1)

> Before this protocol, security review at Phase 9 was prose — "@qa does an OWASP top-10 walk". Prose is unauditable; scanners give signal but only if they speak the same schema. This doc specifies the §5.1 classical security stack: five scanners, one schema, one aggregator — composed into a single `acceptance_check` inside `lifecycle/9-deployment/gate.json`.

**Source decision:** [framework-audit-2026-04-23.md §5.1](../../../lab-hq-projects/hq-p001-coldpress-os/docs/framework-audit-2026-04-23.md) + [oss-integration-survey-2026-04-22.md Tier 1 §1.4](../../../lab-hq-projects/hq-p001-coldpress-os/docs/oss-integration-survey-2026-04-22.md).

---

## The five scanners

| Tool | Upstream | Licence | Coldpress wrapper |
|---|---|---|---|
| [Semgrep OSS](https://github.com/semgrep/semgrep) | semgrep/semgrep | LGPL-2.1 | [`skills/security/scan-code`](../skills/security/scan-code/) |
| [Gitleaks](https://github.com/gitleaks/gitleaks) | gitleaks/gitleaks | MIT | [`skills/security/scan-secrets`](../skills/security/scan-secrets/) |
| [Trivy](https://github.com/aquasecurity/trivy) | aquasecurity/trivy | Apache-2.0 | [`skills/security/scan-deps-and-containers`](../skills/security/scan-deps-and-containers/) |
| [OSV-Scanner](https://github.com/google/osv-scanner) | google/osv-scanner | Apache-2.0 | [`skills/security/scan-vulns`](../skills/security/scan-vulns/) |
| [Syft](https://github.com/anchore/syft) | anchore/syft | Apache-2.0 | [`skills/supply-chain/sbom`](../skills/supply-chain/sbom/) |

All five run independently. Each parses its own CLI output and emits a normalised `ScanResult` JSON at `_context/audit/security/<scanner>-<date>.json`.

**Licence note:** Semgrep OSS is LGPL-2.1; wrapping via subprocess is legally equivalent to using it as an end-user and does not trigger copyleft on coldpress-os. Other wrappers are MIT / Apache-2.0 and unambiguously compatible. See [docs/anthropic-skill-wrapping-audit.md](anthropic-skill-wrapping-audit.md) for the full licence-hygiene table.

---

## The normalised schema

`schemas/security-gate-result.schema.ts` defines three Zod types:

- **`FindingSchema`** — one security finding. Required fields: `id`, `scanner`, `severity`, `title`. Optional: `file`, `line`, `column`, `cwe`, `cve`, `rule_url`, `remediation`, `raw`.
- **`ScanResultSchema`** — one scanner run. `schema_version: 1`, `scanner`, `scanned_at` (ISO-8601), `target`, `status` (`success | error | skipped`), `findings[]`, `summary` (severity histogram).
- **`AggregateResultSchema`** — the aggregator's output. `totals` (summed across scanners), `overall` (`pass | fail`), `blockers[]` (finding ids that failed), `policy`.

### Severity ladder

Five rungs: `critical > high > medium > low > info`. Every scanner's native severity vocabulary maps to these five. `SEVERITY_RANK` (numeric 4→0) enables threshold comparisons (`meetsThreshold(finding, policy.block_severity)`).

### The `total = sum(buckets)` invariant

Every `SeverityCountsSchema` enforces `total === critical + high + medium + low + info` via a Zod `.refine()`. Callers can't accidentally drift; the aggregator's output is trustworthy.

---

## The aggregator

`skills/security/aggregate-gate-results` is the meta-skill the phase-gate evaluator dispatches to. It is wired as a CLI subcommand:

```bash
coldpress security aggregate
```

Pure-function core at `src/security/aggregate.ts` (unit-testable with fixtures; no disk reads in the core).

### Exit-code contract

Matches the phase-gate evaluator:
- `0` — overall pass
- `1` — overall fail (≥1 unwaived finding at-or-above `block_severity`) OR tool error (no scanner outputs, schema-invalid input)

### Policy

- `block_severity` (default `"high"`) — fail threshold. Configurable via `--block-severity` flag or (future) `coldpress.yaml` `security:` block.
- `waivers` — finding ids explicitly signed off. Loaded from `.coldpress/signoffs/security-gate/<finding-id>.yaml`. Each waiver file's presence suppresses that finding's blocker status; the file's YAML body (signed_by, signed_at, comment, expires) is human-read audit only.

---

## Wiring to the Phase-7 gate

[`lifecycle/9-deployment/gate.json`](../lifecycle/9-deployment/gate.json) declares:

```json
{
  "id": "security-scan-classical",
  "description": "5-scanner classical security gate — no HIGH severity findings unsigned",
  "kind": "automated",
  "severity": "block",
  "skill_ref": "aggregate-gate-results"
}
```

`evaluate-phase-gate` (§5.0 protocol) dispatches to `aggregate-gate-results`, reads its exit code, and rolls that into the phase-9 `GateEvaluation`. No bespoke "security gate" layer — gates compose.

---

## What's NOT in this protocol

- **IaC scanners** (Checkov, Terrascan, kube-score) — deferred; gated by repo detection (presence of `*.tf`, `k8s/`, `Dockerfile`). Plan §5.1 bullet.
- **Sigstore / cosign signing** — post-v1.0. Pairs with an SBOM-signing step.
- **SBOM diffing between releases** — deferred to follow-up `sbom-diff` skill if demand surfaces.
- **Auto-remediation.** Scanners report; remediation is agent/human territory (`@developer fix-finding`).

---

## Extending

### Adding a sixth scanner

1. Wrap the CLI in a new `skills/security/scan-<thing>/SKILL.md`. Normalise output to `ScanResult`. Write JSON to `_context/audit/security/<scanner>-<date>.json`.
2. The aggregator auto-discovers files matching `(semgrep|gitleaks|trivy|osv|syft)-*.json` — extend the regex in `src/commands/security.ts` `SCANNER_FILE_PATTERN` to include your scanner's prefix.
3. No schema change required; `ScanResult` is scanner-agnostic.

### Tightening the threshold

Change `block_severity` in the aggregator invocation. Example — block on medium+ for a security-sensitive project:

```bash
coldpress security aggregate --block-severity medium
```

Gate wiring can be customised by editing `lifecycle/9-deployment/gate.json` to pass `block_severity: medium` as a skill argument (skill-argument threading lands in a follow-up block when orchestrator integration ships).

### Waiving a specific finding

Create `.coldpress/signoffs/security-gate/<finding-id>.yaml`:

```yaml
finding_id: "osv.GHSA-xxxx-xxxx-xxxx"
signed_by: "user"
signed_at: "2026-04-24T15:00:00Z"
comment: "false positive — verified upstream, no exploit path"
expires: "2026-07-01"
```

Commit the file; future `coldpress security aggregate` runs will suppress that finding's blocker status until the waiver is removed.

---

## See also

- [phase-gate-protocol.md](phase-gate-protocol.md) — the §5.0 contract this skill plugs into.
- [governance.md](governance.md) — §5.2 sacred-doc validation (pairs with security at the governance boundary).
- [secure-pattern.md](secure-pattern.md) — complementary: the `secure/` pattern keeps credential _values_ out of the repo; the security gate keeps _leaks_ out at deploy time.
