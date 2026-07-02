---
name: "lite-ship"
description: "Lite lane, phase 4 of 4 (Ship). Absorbs full-lane P9 (+ minimal P10): staging smoke → human-triggered production deploy → release record → uptime check wired. Production deploys are human-only, always."
type: "simple"
category: "lifecycle-lite"
agent: "devops"
lane: "lite"
lite_phase: "ship"
tools: ["Read", "Write", "Bash"]
inputs:
  - "the verified release scope + the selected deploy pack"
outputs:
  - artifact: "release record"
    location: "_context/operations/releases/REL-{version}.yaml"
    format: "yaml"
version: "1.0"
---

## Purpose

The lite lane's deployment phase — the full lane's Deployment plus a minimal slice
of Operate. Owner: **`@devops`**. The deploy path is **identically shaped**
regardless of lane or target (same deploy packs, same smoke) — only the ceremony
around it is lighter.

## Non-negotiables (★)

1. **Staging smoke → human production trigger** — production deploys are
   human-triggered, always (`deploy-gate` hook; `disable-model-invocation` on the
   prod-deploy skill). Never auto-deploy to prod.
2. **Release record** — `_context/operations/releases/REL-*.yaml` (version, diffstat, smoke
   results, rollback pointer).
3. **Uptime check wired** — a proportionate monitor (cron hitting key endpoints)
   before the phase closes.

## Process

1. Deploy to **staging** via the deploy pack; run the post-deploy smoke (key routes
   200 + content sentinel + one happy-path Playwright + analytics events arriving).
2. `deploy-gate`: production is blocked unless staging smoke is green.
3. **Human triggers production.** Prod smoke green → the verifier signs the release
   record.
4. Wire the uptime check; write the release record.

## Completion ★

- Staging smoke green → human prod trigger → prod smoke green; release record
  written; uptime check wired. **Human gate: production deploy.**

## Wrap-up (lite P11 substitute)

Lite drops the full P11 retrospective. Instead a 15-minute wrap-up tags any
`run-log` failures for the evolution loop and files a next-iteration note in
`decisions.md`. Re-entry for the next iteration starts back at `lite-spec` (or
`lite-build` for a pure feature add).
