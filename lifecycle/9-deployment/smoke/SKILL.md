---
name: "smoke"
description: "Phase 9 — post-deploy smoke against a deployed URL (staging or prod): fetch the pack's key routes and assert HTTP status + a content sentinel, run one Playwright happy-path spec, and confirm the analytics-plan events arrive at their destination. A green staging smoke is deploy-gate's precondition for prod; a red prod smoke triggers rollback."
type: "simple"
category: "lifecycle"
phase: 9
agent: "devops"
tools: ["Read", "Bash"]
inputs:
  - "a deployed URL (staging or production) + the pack's smoke config"
  - "_context/architecture/analytics-plan (events to assert)"
outputs:
  - artifact: "Smoke result"
    location: "_context/operations/releases/ (attached to the release record)"
    format: "markdown"
---

## Purpose

Answer "is it actually up **and correct**" after a deploy — not just "did the deploy
command exit 0." Identically shaped across packs; reads the selected pack's `smoke`
config.

## Process

Against the target URL (passed by `deploy-staging` / `deploy-prod`):

1. **Routes** — fetch each `smoke.routes` entry; assert HTTP 200 (or the declared status).
2. **Content sentinel** — if `smoke.content_sentinel` is set, assert it appears on the
   primary route (catches a "deployed but blank/error page" that still returns 200).
3. **Happy path** — run the `smoke.happy_path_spec` Playwright spec against the URL
   (one critical end-to-end flow).
4. **Analytics arrival** — if `smoke.asserts_analytics`, trigger the instrumented
   actions and confirm the **analytics-plan events arrive at their destination**
   (the outcome-contract thread — instrumentation is verified, not assumed).
5. **Verdict** — green/red + details, attached to the release record.

## Output

A smoke verdict. On a **staging** run, Butler records the verdict to
`state.deploy.staging_smoke` in `.coldpress/state.yaml` (only Butler writes state) —
that is what the **`deploy-gate`** hook reads to allow `deploy-prod`. **Green staging
smoke** unblocks prod; **red prod smoke** triggers `rollback`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS6-B) | NEW (§5 P9). Uniform post-deploy smoke reading the pack's smoke config; asserts routes + sentinel + Playwright happy path + analytics-plan event arrival (outcome-contract thread). Consumed by deploy-gate (staging) + rollback trigger (prod). |
