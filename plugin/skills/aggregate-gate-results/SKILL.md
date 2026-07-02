---
name: aggregate-gate-results
description: Merge per-scanner ScanResult JSONs into a single AggregateResult; emits pass/fail for the phase-7 security-scan-classical acceptance check
license: MIT
compatibility: Invoked by @verifier in Phase 7
allowed-tools: "Bash Read Write"
version: "1.0"
---

## Purpose

The phase-7 gate (`lifecycle/9-deployment/gate.json` → `security-scan-classical`) dispatches via `skill_ref: aggregate-gate-results`. This skill reads every scanner's `ScanResult` JSON in `_context/audit/security/`, applies the gate policy (block_severity + waivers), emits a single `AggregateResult` JSON, and exits `0` on pass or `1` on fail — matching the phase-gate evaluator contract.

Scanner-agnostic by design: as long as each wrapper emits a valid `ScanResult` (§5.1 schema at `schemas/security-gate-result.schema.ts`), the aggregator treats them uniformly. Swap Semgrep for another SAST; the aggregator never notices.

## When to Use

- Phase 7 pre-deployment — invoked by `evaluate-phase-gate` when the gate is processed
- Ad-hoc: after running the 5 scanners locally, to preview the gate outcome before triggering the orchestrator

## Prerequisites

- The project has been scanned by one or more of: `scan-code` (Semgrep), `scan-secrets` (Gitleaks), `scan-deps-and-containers` (Trivy), `scan-vulns` (OSV-Scanner), `sbom` (Syft) — each dropping its `ScanResult` JSON in `_context/audit/security/`.
- `coldpress` CLI on PATH (the aggregator is built into the core — no separate install).

## Process

1. Invoke the aggregator CLI from the project root:
   ```bash
   coldpress security aggregate
   ```
   Options:
   - `--block-severity <critical|high|medium|low|info>` — override the fail threshold (default `high`).
   - `--input-dir <path>` — where to look for scanner JSONs (default `_context/audit/security/`).
   - `--output <path>` — override aggregate output path.
   - `--dry-run` — skip the file write, print summary to stdout only.
2. The aggregator loads every `(semgrep|gitleaks|trivy|osv|syft)-*.json` file from the input dir, validates each against `ScanResultSchema`, loads waivers from `.coldpress/signoffs/security-gate/<finding-id>.yaml` (one file per waived finding), and runs `aggregate()`.
3. Writes `AggregateResult` JSON to `_context/audit/security/aggregate-{date}.json`.
4. Prints a PASS/FAIL summary badge with severity counts + blocker list (truncated at 10).
5. Exits `0` (pass) or `1` (fail) per the phase-gate evaluator exit-code contract.

## Policy — block_severity + waivers

- **block_severity** (default `high`) — a finding pushes the gate to FAIL when its severity is at-or-above this threshold AND it is not waived.
- **Waivers** are YAML records at `.coldpress/signoffs/security-gate/<finding-id>.yaml`:
   ```yaml
   finding_id: "semgrep.javascript.express.audit.xss.mustache-escape"
   signed_by: "user"
   signed_at: "2026-04-24T15:00:00Z"
   comment: "false positive — manual review confirmed input is escaped upstream"
   expires: "2026-06-01"
   ```
   A waiver file's presence counts as a waiver; content is human-read audit only.
- Waivers are **recorded in git** — reconstructing the sign-off history is `git log .coldpress/signoffs/security-gate/`.

## Output shape

```json
{
  "schema_version": 1,
  "aggregated_at": "2026-04-24T15:00:00Z",
  "scanners": [ /* ScanResult[] */ ],
  "totals": { "critical": 0, "high": 3, "medium": 7, "low": 12, "info": 40, "total": 62 },
  "overall": "fail",
  "blockers": ["semgrep.rule.a", "osv.CVE-2024-12345"],
  "policy": { "block_severity": "high", "waivers": ["gitleaks.rule.b"] }
}
```

## Failure modes

- **No `_context/audit/security/` directory** — skill exits `1` with a hint to run the scanner wrappers first. Does not silently pass.
- **No scanner JSONs in the directory** — same as above.
- **Schema-invalid ScanResult** — skill exits `1` with the specific path + Zod issues. A bad scanner adapter fails loud.

## Interaction with §5.5–§5.7 LLM gates

The LLM gates (`llm-quality-gate`, `prompt-regression`, `llm-security-scan`) are **separate** acceptance checks in `lifecycle/9-deployment/gate.json`, with their own severity + skill_ref. The phase-gate evaluator treats them as peers — no bespoke nesting. Each can independently block Phase 7 per its configured severity.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial aggregator — part of Wave 5 Block Y §5.1. Wired as `coldpress security aggregate` CLI subcommand for phase-gate-evaluator dispatch. Pure-function aggregator in `src/security/aggregate.ts` (unit-testable with fixtures). |
