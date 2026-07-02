---
name: scan-secrets
description: Run Gitleaks against the repo history + working tree; emits normalised ScanResult JSON
license: MIT
compatibility: Invoked by @verifier in Phase 1
version: "1.0"
---

## Purpose

Run [Gitleaks](https://github.com/gitleaks/gitleaks) (MIT) to detect leaked secrets — API keys, tokens, private keys, dotenv values — across both the git history and the working tree. Complements the pre-commit `check-secrets.sh` hook (which scans the staged diff) by covering historical commits and untracked files.

Emits a `ScanResult` conforming to `schemas/security-gate-result.schema.ts`.

## When to Use

- Phase 7 pre-deployment gate (mandatory — any `high`+ finding blocks the deploy)
- After repo-init: once, to establish a clean historical baseline
- Ad-hoc after any credential-rotation event

## Prerequisites

- **Gitleaks on PATH.** Install: `brew install gitleaks` or download from releases.
- Project must be a git repo (Gitleaks relies on `git log` for history scan).

## Process

1. Invoke Gitleaks with JSON output:
   ```bash
   gitleaks detect --source . --report-format json --report-path _context/audit/security/gitleaks-raw.json --no-banner || true
   ```
2. **Normalise** Gitleaks findings (`RuleID`, `Description`, `File`, `StartLine`, `Secret`/`Match`, `Commit`) to `FindingSchema`. Severity mapping:
   - All secret-detection findings are `high` by default (credentials = high stakes).
   - The `Secret`/`Match` field is **NEVER** included in the normalised `FindingSchema` — `description` uses the rule ID + file + line only. Secret values must never enter the audit trail.
3. Compute histogram; write `ScanResult` JSON to `_context/audit/security/gitleaks-{date}.json`.
4. Exit `0` on success (including findings present), `1` only on tool failure.

## Secret-value guardrail

**Critical:** the wrapper MUST strip `Secret` / `Match` from every normalised finding. The `raw` audit field also strips these values before persisting — Gitleaks' native output contains the leaked secret verbatim, which would leak into `_context/audit/` if passed through naively. The wrapper tests enforce this guardrail.

## Output

One `ScanResult` JSON file. Secret values never appear anywhere in the output.

## Failure modes

- **Gitleaks not installed** — aborts with `brew install gitleaks` hint.
- **Not a git repo** — aborts with a hint to `git init` or scan with `--no-git`.

## Licence

Gitleaks is MIT. Subprocess invocation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial Gitleaks wrapper spec — part of Wave 5 Block Y §5.1. Secret-value stripping guardrail codified. Subprocess adapter deferred pending Gitleaks install. |
