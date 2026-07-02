---
name: "deploy-prod"
description: "Phase 9 — deploy to PRODUCTION via the selected deploy pack. HUMAN-TRIGGERED ONLY (disable-model-invocation) and gated by the deploy-gate hook: prod is blocked unless staging smoke is green, Phase 8 is complete, and an acceptance record exists where required. Runs prod smoke; the verifier signs the release record."
type: "workflow"
category: "lifecycle"
phase: 9
agent: "devops"
disable-model-invocation: true
tools: ["Read", "Bash"]
inputs:
  - "coldpress.yaml deploy_pack + the pack's pack.yaml"
  - "a green staging smoke result + (client projects) an acceptance record"
outputs:
  - artifact: "Production deployment + signed release record"
    location: "_context/operations/releases/REL-*.yaml"
    format: "yaml"
---

## Purpose

Ship to **production** — the one step the framework insists a human triggers.
`disable-model-invocation: true` means Claude never auto-fires this from a
description match; you invoke it explicitly, and the **`deploy-gate` hook** still
independently blocks it unless the preconditions hold. Two guards, on purpose.

## Prerequisites (enforced by `deploy-gate`)

- **Staging smoke green** (the same build, verified on staging).
- **Phase 8 complete** (all wave stories `verifier: pass`).
- **Acceptance record present** where required (client projects — UAT sign-off, WS6-E).

## Process

1. **Confirm the human trigger** — this skill is only reached by explicit invocation.
2. **Resolve the pack** + stack inputs (as `deploy-staging`), targeting `targets.production`.
3. **Deploy** — run `targets.production.deploy_cmd` (e.g. `vercel deploy --prod`,
   `wrangler pages deploy --branch main`).
4. **Prod smoke** — run `smoke` against the production URL (routes + sentinel +
   Playwright happy path + analytics-plan events arriving). A red prod smoke triggers
   `rollback`, not a retry-in-place.
5. **Release record** — write `_context/operations/releases/REL-*.yaml` (version, diffstat,
   smoke results, rollback pointer); the **verifier signs** it on prod-smoke green.

## Output

A live production deployment + a signed release record. **Human gate: production
deploy** (the P9 exit human gate).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS6-B) | NEW (§5 P9). Human-only prod deploy split out of the transitional `deploy` skill; `disable-model-invocation` (moved here from `deploy` per WS5-D) + `deploy-gate` hook are the two independent guards. |
