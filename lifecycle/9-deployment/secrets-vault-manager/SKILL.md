---
name: "secrets-vault-manager"
description: "Audit + rotate secrets across .env files, secure/manifest.yaml, and CI/CD secret stores. Detects committed secrets, missing-from-manifest credentials, and rotation-due-by-date entries. Issues remediation actions; does NOT auto-rotate (user-confirmed only)."
type: "simple"
category: "lifecycle"
phase: 9
agent: "devops"
license: "MIT"
version: "1.0"
updated: "2026-05-03"
inputs:
  graph_queries:
    - "CredentialName nodes (from secure-manifest enrichment)"
  cold_file_reads:
    - "secure/manifest.yaml"
    - "secure/.env*"
    - ".env*"
    - ".github/workflows/*.yml"
  existence_checks:
    - "secure/manifest.yaml"
    - ".gitignore (must exclude secure/ + .env)"
outputs:
  - artifact: "Secrets audit report"
    location: "_context/audit/secrets-audit-{date}.md"
    format: "markdown"
    sacred: false
  - artifact: "Rotation runbook"
    location: "_context/audit/secrets-rotation-runbook-{date}.md"
    format: "markdown"
    sacred: false
---

## Purpose

Phase 9 pre-deploy gate skill that surfaces secrets-management issues before tagging a release. Three checks: (1) committed-secret detection, (2) manifest-vs-env consistency, (3) rotation-due tracking. **Does not auto-rotate** — emits a runbook the user executes against the relevant secret stores.

## When to Use (Proactive Triggers)

1. Pre-deploy gate (phase-9 readiness-check sub-step)
2. User says "audit secrets" / "rotate keys" / "check credentials"
3. Quarterly hygiene cron (rotation-due tracking)
4. Post-incident — when a credential leak is suspected

## Output Artifacts

1. **Secrets audit report** at `_context/audit/secrets-audit-{date}.md` — categorised findings (CRITICAL committed-secret / HIGH missing-from-manifest / MEDIUM rotation-overdue / LOW orphaned-key)
2. **Rotation runbook** at `_context/audit/secrets-rotation-runbook-{date}.md` — step-by-step remediation per finding (rotate-in-store + update-manifest + update-CI-secret + test + invalidate-old)
3. **Manifest update PR (proposal)** — staged diff against `secure/manifest.yaml` reflecting new metadata (rotation date bumped, new fields added)
4. **CI secret audit** — list of secrets referenced in `.github/workflows/*.yml` that aren't in manifest (or vice versa)

## Prerequisites

- `secure/manifest.yaml` exists (created by Phase 1 scaffold; tracks credential metadata only — not values)
- `.gitignore` excludes `secure/.env*` + repo-root `.env*` (committed-secret detection assumes this baseline)
- For rotation-due tracking: manifest entries have `rotation_due:` ISO-date field

## Process

1. **Committed-secret detection**: scan `git log --all -p` for known secret patterns (AWS keys `AKIA[0-9A-Z]{16}`, GitHub PATs `ghp_*` / `github_pat_*`, generic JWT, `.env` content patterns, RSA private key headers). Use `git secrets`-style regex set. Surface CRITICAL.
2. **Manifest-vs-env consistency**:
   - For each entry in `secure/manifest.yaml`, check that `secure/.env.{environment}` actually has the named variable (HIGH if missing).
   - For each var in `secure/.env*`, check it's declared in manifest (LOW orphan if not).
3. **CI secret audit**: parse `.github/workflows/*.yml` for `${{ secrets.* }}` references. Cross-check with manifest. Flag each direction.
4. **Rotation-due tracking**: read manifest entries; for each with `rotation_due: <ISO-date>` past today, emit MEDIUM. Within 14 days = warn.
5. **Emit audit report** at `_context/audit/secrets-audit-{date}.md`. Format:
   ```
   ## Findings (count by severity)
   - CRITICAL: <N> (committed secrets)
   - HIGH: <N> (manifest mismatches)
   - MEDIUM: <N> (rotation overdue)
   - LOW: <N> (orphaned keys)

   ### CRITICAL: <slug>
   - File: <path>
   - Commit: <hash>
   - Pattern: <type>
   - Action: rotate immediately + revoke + audit access logs
   ```
6. **Emit rotation runbook** at `_context/audit/secrets-rotation-runbook-{date}.md` — per-finding step list.
7. **Surface to user**: "Secrets audit: <X> CRITICAL, <Y> HIGH. Pre-deploy gate is BLOCKED until CRITICAL findings resolved. Rotation runbook at `<path>`. Resolve before tagging."

## Activation-Gate Checklist

- [ ] Committed-secret scan complete; zero CRITICAL findings (block deploy if present)
- [ ] Manifest-vs-env consistency verified (HIGH findings surfaced; user acknowledged)
- [ ] CI secret audit cross-referenced
- [ ] Rotation-due entries within 30 days flagged
- [ ] Audit report + rotation runbook emitted

## Output

Audit report + rotation runbook in `_context/audit/`. CRITICAL findings BLOCK Phase 9 readiness gate. User executes rotation manually (skill does not auto-rotate).

## Source Attribution

Pattern adapted from `alirezarezvani/claude-skills` (MIT) `env-secrets-manager` skill. Implementation original to coldpress-os; integrates with existing `secure/manifest.yaml` + Phase 9 readiness-check infrastructure.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U02) | Initial secrets-vault-manager skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT). |
