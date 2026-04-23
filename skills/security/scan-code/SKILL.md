---
name: "scan-code"
description: "Run Semgrep OSS rule-based SAST on the project source; emits normalised ScanResult JSON"
type: "simple"
category: "security"
agent: "qa"
phases: [7]
tools: ["Bash", "Read", "Write"]
inputs:
  - "project source tree"
  - "optional Semgrep config (`semgrep.yml` or registry ruleset)"
outputs:
  - artifact: "Semgrep scan result"
    location: "_context/audit/security/semgrep-{date}.json"
    format: "json"
version: "1.0"
---

## Purpose

Run [Semgrep OSS](https://github.com/semgrep/semgrep) (LGPL-2.1) against the project source tree. Shallow, fast, high-signal static analysis catching OWASP-relevant code-level issues (injection, SSRF, path traversal, auth mistakes, known bad patterns per-language).

Emits a `ScanResult` conforming to `schemas/security-gate-result.schema.ts` at `_context/audit/security/semgrep-{date}.json`. The aggregator (`aggregate-gate-results`) merges this with outputs from the other four scanners to produce the phase-7 `security-scan-classical` acceptance check.

## When to Use

- Phase 7 pre-deployment gate — wired in via `lifecycle/7-deployment/gate.json` → `aggregate-gate-results`
- Ad-hoc: after any meaningful code change; before opening a PR
- CI: wired into the release workflow (optional — see `docs/security-gate.md`)

## Prerequisites

- **Semgrep on PATH.** Install: `pip install semgrep` or `brew install semgrep`.
- A Semgrep config. Default: `semgrep --config=auto` auto-selects language rulesets. For tighter control, commit a `semgrep.yml` at repo root or pass `--config=<registry-slug>`.

## Process

1. Invoke Semgrep with JSON output:
   ```bash
   semgrep --config=auto --json --metrics=off --error > _context/audit/security/semgrep-raw.json || true
   ```
   Trailing `|| true` because Semgrep exits non-zero on findings; the wrapper — not the gate — decides fail vs pass.
2. **Normalise** Semgrep's native finding shape (`results[].check_id`, `.extra.severity`, `.path`, `.start.line`, `.extra.metadata.cwe`, `.extra.metadata.source`) to `FindingSchema`. Map Semgrep severity:
   - `ERROR` → `high`
   - `WARNING` → `medium`
   - `INFO` → `info`
3. Compute the severity-counts histogram.
4. Write the `ScanResult` JSON to `_context/audit/security/semgrep-{date}.json`.
5. Exit `0` on success (including findings-present), `1` only on Semgrep process-level failure (binary not found, config error).

## Output

One `ScanResult` JSON file. Example skeleton:

```json
{
  "schema_version": 1,
  "scanner": "semgrep",
  "scanner_version": "1.90.0",
  "scanned_at": "2026-04-24T15:00:00Z",
  "target": ".",
  "status": "success",
  "findings": [
    {
      "id": "semgrep.javascript.express.audit.xss.mustache-escape",
      "scanner": "semgrep",
      "severity": "high",
      "title": "Unsanitised user input rendered into Mustache template",
      "file": "src/routes/user.ts",
      "line": 42,
      "cwe": "CWE-79"
    }
  ],
  "summary": { "critical": 0, "high": 1, "medium": 0, "low": 0, "info": 0, "total": 1 }
}
```

## Failure modes

- **Semgrep not installed** — skill aborts `exit 1` with `pip install semgrep` hint. Does not silently skip.
- **No ruleset resolvable** — aborts with a hint to commit a `semgrep.yml` or use `--config=auto`.
- **Large monorepo timeout** — Semgrep has built-in timeouts (`--timeout=30`). Wrapper surfaces timeouts as `status: "error"` with `error_message`.

## Licence

Semgrep OSS is LGPL-2.1. Invoked as a subprocess — no static linking, no distribution of Semgrep binaries with coldpress-os. The wrapper script is MIT.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial Semgrep wrapper spec — part of Wave 5 Block Y §5.1 security stack. Subprocess adapter deferred until Semgrep is installed for end-to-end validation. |
