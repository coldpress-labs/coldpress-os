---
phase: 9
name: Deployment
agent: devops
status: rewritten — Phase 9 implementation in progress (autonomous queue unit #15, 2026-05-02)
---

# Phase 9 — Deployment

> **Cascade rename of old Phase 7 (Deployment) + Shape A scope refinement (2026-04-24).** Same 6 skills, same owner (@devops). Inherits well-established security-gate + LLM-gates + phase-gate-protocol + observability-setup infrastructure.

## Purpose

**Phase 9 is verification + execution + recording.** Verifies deployment readiness via 5 pre-deploy gates, executes deployment, verifies post-deploy via 3 gates. No spec authoring — divergence routes back via re-entry OR forward to Phase 10 Operate as ops-issue.

## Sub-skills

| Skill | Type | Owner | Notes |
|-------|------|-------|-------|
| `readiness-check` | workflow | @devops | Phase 9 entry skill (Q1 — Step 0 absorbs entry-sync); meta-aggregator |
| `env-check` | workflow | @devops | Env vs baseline verification |
| `security-scan` | workflow | @devops | Wraps 5 classical + 3 LLM gates (existing security-gate spec) |
| `dep-health-check` | workflow | @devops | Dependency pinning + advisories (cheap, runs every Phase 9 entry) |
| `db-migration-check` | workflow | @devops | Brownfield-conditional |
| `deploy-staging` | workflow | @devops | Pack-driven staging deploy (model-invocable); build via the locked stack, ship via the pack CLI |
| `deploy-prod` | workflow | @devops | Pack-driven **human-only** prod deploy (`disable-model-invocation` + `deploy-gate`); signs the release record |
| `deploy-preview` | simple | @devops | Per-story/wave preview URL (when the pack supports it) for the clean-room verifier + continuous review |
| `smoke` | simple | @devops | Post-deploy smoke: routes + content sentinel + Playwright happy path + analytics-plan event arrival |
| `rollback` | simple | @devops | Pack `rollback_cmd` recovery; human-decided; rehearsed once on staging |
| `secrets-vault-manager` | simple | @devops | **NEW (Unit #28 / U02)** — committed-secret regex scan + manifest-vs-env consistency + CI secret audit + rotation-due tracking. **Surface-only** (does NOT auto-rotate). CRITICAL findings BLOCK Phase 9 gate. |
| `observability-designer` | workflow | @devops | **NEW (Unit #28 / U03)** — wraps `coldpress-os/docs/observability-setup.md` doc. Emits SLO/SLI table + multi-window multi-burn-rate alerts + golden-signals dashboards + head+tail trace sampling. Vendor-neutral. |
| `dependency-auditor` | workflow | @devops | **NEW (Unit #28 / U09)** — DEEP audit (CVE via OSV/NVD/GitHub-Advisory + supply-chain heuristics + license audit + 0-100 health score). Complements `dep-health-check` (cheap-always vs deep-on-demand). License-block findings BLOCK Phase 9 gate. |

## Gate split (per Q2)

**Pre-deploy gate (5 checks, block-severity):** readiness-check / env-check / security-scan / dep-health-check / db-migration-check (conditional). Block deploy if any fail.

**Deploy:** action skill — runs deployment, emits deploy-log validated-distillate.

**Post-deploy gate (3 checks):** deploy-success (block) / smoke-tests-pass (block) / observability-baseline-met (warn). Cannot exit Phase 9 if any block.

## Recommended flow

```
[Phase 8 exit: all stories complete + tests passing + implementation-deltas resolved]
        │
        ▼
   readiness-check (Step 0 — graph-first context + entry-sync absorbed)
     ├──→ env-check
     ├──→ dep-health-check
     ├──→ security-scan (5 classical + 3 LLM aggregated)
     ├──→ db-migration-check (conditional brownfield)
     └──→ pre-deploy gate evaluation (block if any fail)
        │
        ▼
   deploy-staging (pack-driven) ──→ smoke (staging)
        │  green staging smoke
        ▼
   deploy-gate: prod blocked unless staging smoke green + P8 complete + acceptance record
        │  human trigger
        ▼
   deploy-prod (human-only) ──→ smoke (prod) ──→ release record signed
        │  (red prod smoke → rollback)
        ▼
   post-deploy verification
     ├──→ smoke tests
     ├──→ observability baseline check
     └──→ post-deploy gate evaluation
        │
        ▼
   phase-transition (writes phase-9-to-10 handoff)
        │
        ▼
   [Phase 10 entry — @devops continues into Operate]
```

## Entry conditions

1. Phase 8 gate passed (all stories complete; tests passing; implementation-deltas resolved).
2. Code committed to deployment-target branch.
3. CI green (all green from Phase 8).
4. phase-8-to-9 handoff written.

## Exit conditions

See `gate.json` (8 acceptance checks). Pre-deploy 5 + post-deploy 3 split per Q2.

## Agent

**@devops** primary. Pattern 7 fifth invocation:
- #14: phase_entry — phase-transition → @devops
- #15: phase_exit — @devops → phase-transition
- #16: phase_entry (Phase 10) — phase-transition → @devops (continues — same agent across boundary)

Phase 9 → 10 is unique: @devops continues across the boundary (Phase 10 Operate is also @devops-owned).

## Cross-cutting wire-ins

- `adversarial-review` — deploy plan red-team; rollback-strategy challenge
- `editorial` — deploy-log + readiness report structure
- `editorial` — rollback-strategy prose

## Method playbook

See `data/methods/method-defaults.yaml` `phase_9:` section. Tier-1: problem_solving heavy (failure_mode_analysis + scenario_planning + root_cause); advanced_elicitation medium (vague_rollback_strategy / vague_deployment_topology); rest low.

## Existing infrastructure (well-established — no re-spec)

- `docs/security-gate.md` — 5 classical scanners + aggregator (`aggregate-gate-results`)
- `docs/llm-gates.md` — 3 LLM gates (DeepEval / Promptfoo / Giskard)
- `docs/phase-gate-protocol.md` — phase-gate evaluator contract
- `docs/observability-setup.md` — Phase 9 gate consumes observability exporter

## Source

- Deep-dive: [`docs/lifcyle-phases-deep-dives/phase-9-deep-dive-2026-05-02.md`](../../docs/lifcyle-phases-deep-dives/phase-9-deep-dive-2026-05-02.md) v1.0
- Implementation plan: [`docs/phase-ii-implementation-plan.md` Part 9](../../docs/phase-ii-implementation-plan.md) v1.25

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (Andy-coldpress-os under autonomous queue unit #15 Wave 9.1) | Phase 9 README enriched. Cascade-rename + Shape A scope refresh framing. 6 sub-skills with @devops ownership. Pre-deploy + post-deploy gate split per Q2. Pattern 7 fifth invocation (3 transitions). Existing security-gate infrastructure referenced. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial Phase 7 (now 9) Deployment README. |
