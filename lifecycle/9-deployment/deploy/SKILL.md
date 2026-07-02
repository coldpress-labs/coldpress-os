---
name: "deploy"
description: "Execute deployment to target environment with verification"
type: "workflow"
category: "lifecycle"
phase: 9
agent: "developer"
disable-model-invocation: true
inputs:
  - "_context/sacred/tech-stack.md"
  - "coldpress.yaml"
outputs:
  - artifact: "Deployment Log"
    location: "_context/tracking/deploy-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Deploys the application through the selected **deploy pack**, identically shaped
regardless of target: **staging first → human production trigger → prod smoke**.
Deploys are **CLI-driven** (wrangler / vercel / netlify / railway / ssh+compose —
prefer CLIs over MCP servers), and every deploy is gated and recorded.

Production is **never model-triggered** — `disable-model-invocation: true` on this
skill, plus the `deploy-gate` hook (prod blocked unless staging smoke is green,
Phase 8 is complete, and an acceptance record exists where required). Butler /
the human runs the prod step explicitly.

## When to Use

- After `readiness` passes (build, env vs `secure/manifest`, SBOM, headers,
  license, budgets — the scripted hard checklist).
- Staging deploy: any time the wave is verified. Production deploy: **explicit
  human trigger only.**

## Prerequisites

- `readiness` green; full suite green; Phase 8 complete.
- `deploy_pack` selected in `coldpress.yaml` (Phase 3 `deploy-select`), env/secrets
  mapped into the `secure/` manifest pattern.
- Staging target defined by the pack.

## Process

Three steps — see [workflow.md](workflow.md): **target** (resolve pack + environment
from `coldpress.yaml`), **execute** (CLI deploy to staging; prod only on human
trigger through `deploy-gate`), **verify** (post-deploy **smoke**: fetch key routes,
assert status + a content sentinel + one Playwright happy path + that the
analytics-plan events arrive at their destination).

> **Pack-specific verbs** (`deploy-staging`, `deploy-prod`, `deploy-preview`,
> `rollback`, per-pack smoke) are provided by the deploy packs in **WS6** — this
> skill is the uniform, pack-agnostic entry point they specialise.

## Output

Deployed application (staging, then prod on human trigger) + a **release record**
at `_context/ops/releases/REL-*.yaml` (version, diffstat, smoke results, rollback
pointer). The verifier signs the release record on prod smoke green.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-07-03 | Butler (v0.4 WS5-E) | REBUILD from the v1.0 legacy skill (§5 P9). Reframed to the v0.4 model: staging-first → **human** prod trigger (`disable-model-invocation` + `deploy-gate` hook — never auto-deploy) → prod smoke; CLI-driven; post-deploy smoke (routes + status + content sentinel + Playwright happy path + analytics-plan event arrival); release record at `_context/ops/releases/REL-*.yaml`; verifier signs on prod-smoke green. Pack-specific verbs (deploy-staging/prod/preview, rollback) delegated to the WS6 deploy packs. |
| 1.0 | 2026-04-13 | Alfred | New deployment skill for coldpress-os. |
