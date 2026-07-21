---
name: "readiness"
description: "Phase 9 pre-deploy meta-aggregator — the scripted hard checklist that gates a deploy: build passes; env vars vs secure/manifest; DNS/robots/sitemap; npm audit (fail high/critical); SBOM (CycloneDX via cdxgen); security-headers verification on staging (CSP/HSTS/X-Frame-Options/Referrer-Policy); cookie flags; .env/sourcemap exposure probe; license scan; Lighthouse vs budgets.yaml; T2 lockfile-pinning. Runs the security/scan-* suite. Emits the readiness-report."
type: "workflow"
category: "lifecycle"
phase: 9
agent: "devops"
tools: ["Read", "Bash"]
inputs:
  graph_queries:
    - "sprint-status.yaml (story tracking)"
    - "implementation-readiness-v{latest}"
    - "coldpress-yaml-baselines"
  cold_file_reads:
    - "_context/handoffs/phase-8-to-9-{date}.md"
    - "secure/manifest.yaml"
    - "_context/design/budgets.yaml (schema: schemas/design/budgets.schema.ts — the Lighthouse/CWV + a11y contract, G12)"
  existence_checks:
    - "sprint-status-final == true (all stories done)"
    - "phase-8-to-9 handoff exists"
    - "implementation-readiness Phase 7 report exists with overall_status: pass"
outputs:
  - artifact: "Readiness Report + SBOM"
    location: "_context/audit/readiness-v{N}.md"
    format: "markdown"
    sacred: false
    distillate: true
    schema: "schemas/audit/readiness.schema.json"
---

## Purpose

The Phase 9 **scripted hard checklist** — the meta-aggregator that decides whether
a build may deploy. Every check is scripted (block on fail), not vibes: this is
where the security thread (G3), budgets (G12), and license compliance (G13)
converge into one report the `deploy-gate` reads. Rebuilt from `readiness-check`;
absorbs `dependency-auditor`; the security scanning runs through the designed
`security/scan-*` suite (the generic `ops/security-scan` + `ops/dep-health-check`
are retired — superseded here).

## The checklist (all block-severity unless noted)

1. **Build passes** — the locked stack's build command succeeds; output at BUILD_DIR.
2. **Env vars vs `secure/manifest.yaml`** — every required key is present (names only; values never printed). Absorbs the old `env-check`.
3. **Dependency + vuln scan** — `npm audit` (fail **high/critical**) **plus** the
   `security/scan-*` suite (Semgrep SAST, OSV, Trivy → normalised ScanResult,
   aggregated by `aggregate-gate-results`). Absorbs `dependency-auditor`.
4. **SBOM emission** — CycloneDX via `cdxgen`, attached to the release record (supply-chain).
5. **Security headers (on staging)** — a curl script asserts CSP, HSTS,
   X-Frame-Options, Referrer-Policy; **cookie flags** (Secure/HttpOnly/SameSite).
6. **`.env` / sourcemap exposure probe** — no secrets or sourcemaps served publicly.
7. **DNS / robots / sitemap** — expected DNS records; `robots.txt` + `sitemap.xml` present + sane.
8. **License scan (re-run, G13)** — re-run the P3 stack-lock license policy over the
   shipped dependency set; block on GPL/AGPL/SSPL in client-shipped code.
9. **Lighthouse vs `budgets.yaml` (G12)** — LCP/CLS/INP + JS/image weight vs the
   P5 budgets; block on regression.
10. **T2 only — lockfile-pinning check** — exact-pinned lockfile for revenue/PII tiers.
11. **`db-migration-check`** (conditional) — brownfield / persistence projects.

→ Full step flow in [workflow.md](workflow.md).

## When to Use

- Phase 9 entry — the first thing that runs before any deploy.
- Its report is the precondition the `deploy-gate` hook checks before `deploy-prod`.

## Output

`_context/audit/readiness-v{N}.md` (schema'd) + the SBOM. Green readiness → the wave
may `deploy-staging`; a red check blocks. Post-deploy `smoke` + the release record
are separate skills.

**Frontmatter — must satisfy `schemas/audit/readiness.schema.json`** (VP2 O44: this
skill previously shipped no template while the schema required nine fields, so the
emitted report never validated). One `checks[]` entry per checklist item above:

```yaml
---
schema: "schemas/audit/readiness.json"
phase: 9
version: 1                     # integer; bump per readiness run
variant: "pre-deploy"          # pre-deploy | post-deploy
author_agent: "@devops"
status: "validated"            # draft | validated | superseded
created_at: "<ISO-8601>"
overall_status: "pass"         # pass | fail | warn
checks:
  - check_id: "env-check"
    kind: "env-check"          # env-check | dep-health-check | security-scan | db-migration-check |
                               # smoke-test | observability-baseline | rollback-plan | feature-flag-state
    status: "pass"             # pass | fail | warn | skip
    severity: "block"          # block | warn | info
    summary: "env vars present and match secure/manifest.yaml"
    evidence_ref: "_context/operations/sbom-npm-ls-<date>.json"
    remediation: null
---
```

## Cross-cutting wire-ins

- `secrets-vault-manager` — committed-secret scan (kept; human-confirmed).
- `adversarial-review` — pre-deploy plan red-team.
- `editorial` — readiness-report structure.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-07-03 | Butler (v0.4 WS6-C) | REBUILD `readiness-check` → `readiness` (§5 P9). Now the full scripted hard checklist: build; env-vs-manifest (absorbs `env-check`); `npm audit` + the `security/scan-*` suite (absorbs `dependency-auditor`; supersedes the generic `ops/security-scan` + `ops/dep-health-check`); **SBOM** (cdxgen, G3); **security headers** + cookie flags (curl on staging); `.env`/sourcemap probe; DNS/robots/sitemap; **license** re-run (G13); **Lighthouse vs budgets.yaml** (G12); T2 lockfile pinning; conditional db-migration-check. Post-deploy smoke split out to the `smoke` skill (WS6-B). |
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #15 Wave 9.2) | Phase 9 rewrite — entry skill + meta-aggregator (graph-first; pre/post-deploy variants). |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial readiness-check skill. |
