---
phase: 10
name: Operate
agent: devops
status: rewritten — Phase 10 implementation in progress (autonomous queue unit #18, 2026-05-02)
---

# Phase 10 — Operate

> **Cascade rename of old Phase 8 (Operate) + Shape A scope refinement (2026-04-24).** Same 3 skills, same owner (@devops — continues from Phase 9 per Pattern 7 transition #16; no agent change at entry).

## Purpose

**Phase 10 is continuous in-flight operational work post-deploy.** While the system runs in production:
- Sprint-status updates (per ongoing iteration)
- Course-correction (incident / bug / friction triggers)
- Document-project — canonical end-user-facing project documentation

**Phase 10 surfaces ops-deltas** as fourth forward-carry instance (Phase 5 design / Phase 7 architecture / Phase 8 implementation / **Phase 10 ops** — completing the forward-carry quartet). Aggregated at user-invoked Phase 11 transition; consumed by Phase 11 Evolve as input to retrospective + product-evolution.

**Phase 10 is NOT** retrospectives, product-evolution planning, or innovation-strategy — those live in Phase 11.

## Sub-skills

| Skill | Type | Owner |
|-------|------|-------|
| `operate-loop` | workflow | @devops (entry skill per Q1) |
| `ops-check` | workflow | @devops — **NEW (WS8)**. Scheduled ops digest: deploy-pack connectors (analytics/uptime/error/cert/backup/CVE-rescan) → **actual-vs-target against outcomes.yaml**. CVE high+ auto-creates an incident. |
| `client-health-report` | workflow | @devops — **NEW (WS8, client projects)**. Monthly one-pager from the ops-check digests: outcome trends, reliability, renewals, recommended next work. |
| `correct-course` | workflow | @devops (3 triggers per Q5) — process drift / scope creep / metric anomaly |
| `document-project` | workflow | @devops (post-deploy end-user-facing docs per Q4) |
| `incident-response` | workflow | @devops — **NEW (Unit #28 / U12)**. Three sub-modes (in-flight timeline / post-mitigation postmortem / codify runbook). Distinct from `correct-course` (process drift) and Phase 11 retrospective (multi-incident pattern analysis). 5 artefacts: timeline / postmortem / runbook / ops-delta / action-items. Pattern-match against priors at detection (search-first reduces MTTR). Forward-carry per `ops-delta.schema.json`. |

## Recommended flow (continuous)

```
[Phase 9 exit: deployed + post-deploy gate passed]
        │
        ▼
   operate-loop (Step 0 — graph-first context + entry-sync)
        │
        ▼
   Continuous loop (user-defined iteration cadence):
     ├──→ operate-loop update (sprint-status-v{N}, per iteration)
     ├──→ correct-course (incident / bug / friction triggers)
     └──→ document-project (canonical user-facing docs)
        │
        ▼
   [User invokes Phase 11 retrospective]
        │
        ▼
   phase-transition (writes phase-10-to-11 handoff with ops_deltas[] aggregated)
        │
        ▼
   [Phase 11 entry — @reviewer]
```

## Entry conditions

1. Phase 9 exit clean (post-deploy gate passed).
2. phase-9-to-10 handoff written.
3. System running in production.

## Exit conditions

See `gate.json` (5 acceptance checks). User-invoked exit (Phase 11 retrospective trigger).

## Agent

**@devops** primary. Pattern 7 sixth invocation:
- #16: phase_entry — phase-transition → @devops (continued from Phase 9; same agent)
- #17: phase_exit — @devops → phase-transition (user-triggered)
- #18: phase_entry (Phase 11) — phase-transition → @reviewer (warm_handoff: phase-10-to-11 with ops_deltas[])

## ops-deltas mechanism (NEW — fourth forward-carry instance)

Schema: `schemas/handoffs/ops-delta.schema.json`. Surfaced during course-correction or operate-loop iterations. delta_type enum: bug / performance / ux-friction / doc-gap / dependency-issue / security-incident. reconciliation_options enum: accept_into_phase_11_retrospective / accept_into_phase_11_product_evolution / immediate_corrective_action / park_for_phase_11.

**Reconciliation:** at Phase 10 EXIT (user-invoked Phase 11 transition). phase-transition step-02a-reconciliation extends to handle from_phase==10 — forwards ops_deltas[] to Phase 11 handoff (does NOT amend PRD; ops issues are learnings/improvements, not spec changes).

## Cross-cutting wire-ins

- `adversarial-review` — incident response red-team
- `editorial` — course-correction log; doc-project structure
- `editorial` — doc-project user-facing prose

## Method playbook

See `data/methods/method-defaults.yaml` `phase_10:` section. Tier-1: problem_solving heavy (root_cause + five_whys + failure_mode_analysis + scenario_planning); advanced_elicitation medium (vague_incident_cause / vague_corrective_action); rest low.

## Source

- Deep-dive: [`docs/lifcyle-phases-deep-dives/phase-10-deep-dive-2026-05-02.md`](../../docs/lifcyle-phases-deep-dives/phase-10-deep-dive-2026-05-02.md) v1.0
- Implementation plan: [`docs/phase-ii-implementation-plan.md` Part 10](../../docs/phase-ii-implementation-plan.md) v1.26

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (Andy-coldpress-os under autonomous queue unit #18 Wave 10.1) | Phase 10 README enriched. Cascade-rename + Shape A scope refresh. Continuous-loop framing. ops-deltas mechanism explainer (fourth forward-carry instance). Pattern 7 sixth invocation. @devops continues from Phase 9. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial Phase 8 (now 10) Operate README. |
