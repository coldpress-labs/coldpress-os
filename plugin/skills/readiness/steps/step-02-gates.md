---
step_number: 2
step_name: "Run the scripted hard checklist"
step_goal: "Execute the Phase 9 deploy-readiness checks in order; each is scripted and block-severity"
halts_for_input: false
next_step: "step-03-report.md"
---

## Instructions

Run the checklist **in order** (cheapest signal first). Every check is **scripted**
(a script decides PASS/FAIL, not vibes) and **block-severity** unless noted — a
single FAIL blocks the deploy. This is where the security thread (G3), budgets
(G12), and license compliance (G13) converge for the `deploy-gate` to read.

1. **Build passes** — the locked stack's `${BUILD_CMD}` succeeds; artifact at `${BUILD_DIR}`.
2. **Env vars vs `secure/manifest.yaml`** — every required key is present (names only; values never printed).
3. **Dependency + vuln scan** — `npm audit` (fail **high/critical**) **plus** the `security/scan-*` suite (Semgrep SAST, OSV, Trivy → normalised ScanResult, aggregated by `aggregate-gate-results`).
4. **SBOM emission** — CycloneDX via `cdxgen`, attached to the release record (supply-chain, G3).
5. **Security headers (on staging)** — a curl script asserts CSP, HSTS, X-Frame-Options, Referrer-Policy; **cookie flags** (Secure / HttpOnly / SameSite).
6. **`.env` / sourcemap exposure probe** — no secrets or sourcemaps served publicly.
7. **DNS / robots / sitemap** — expected DNS records; `robots.txt` + `sitemap.xml` present + sane.
8. **License scan (re-run, G13)** — re-run the P3 stack-lock license policy over the shipped dependency set; block on GPL/AGPL/SSPL in client-shipped code.
9. **Lighthouse vs `budgets.yaml` (G12)** — LCP / CLS / INP + JS/image weight vs the P5 budgets; block on regression.
10. **T2 only — lockfile-pinning check** — exact-pinned lockfile for revenue/PII tiers (skipped below T2).
11. **`db-migration-check` (conditional)** — brownfield / persistence projects only.

**Cross-cutting wire-ins:** `secrets-vault-manager` (committed-secret scan, human-confirmed), `adversarial-review` (pre-deploy plan red-team), `editorial` (report structure).

Each check records a PASS / FAIL with findings. Do not stop on the first failure — run the full checklist so the report lists **every** blocker at once.

## Output

Every check executed with a PASS/FAIL + findings; SBOM emitted. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-report.md](step-03-report.md)
