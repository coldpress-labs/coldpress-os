---
name: breakdown-entry-sync
description: Phase 7 entry skill — graph-first context load for breakdown work, architecture-deltas reconciliation pass (forward-carry from Phase 6), and breakdown-scope memo emit. First real consumer of validate-prd --sections lightweight-amendment path.
license: MIT
compatibility: Invoked by @pm in Phase 7
version: "1.0"
---

## Purpose

Phase 7 entry skill (NEW — analogous to Phase 4's `planning-entry-sync`). Three roles:

1. **Graph-first context load** for the 5 downstream Phase 7 skills (epics, stories, parallelization, sprint, readiness) — load once, reuse via graph queries.
2. **Architecture-deltas reconciliation pass** — if Phase 6 surfaced any architecture-deltas (forward-carry from Phase 6 §12), reconcile here at Phase 7 ENTRY (per Q2). Mirror of Phase 5's design-deltas mechanism but at-entry instead of at-exit.
3. **Breakdown-scope memo emit** — captures archetype + active baselines + open issues + flagged-architecture-deltas-status + persona-targets summary; consumed by all 5 downstream skills.

CRITICAL: this skill is the **first real consumer of `validate-prd --sections=<list>`** (the lightweight PRD amendment path that Phase 5 reconciliation deferred to actual implementation).

## When to Use

- Phase 7 entry — invoked automatically as the first Phase 7 skill after `phase-transition` writes phase-6-to-7 handoff.
- Re-runnable: yes, when re-entering Phase 7 after upstream amendment.

## Prerequisites

- Phase 6 gate passed.
- `_context/sacred/architecture.md` exists with `sacred: true` + `governance: locked`.
- `phase-6-to-7-{date}.md` handoff written.

## Process

3-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/planning/breakdown-scope-v{N}.md` — validated-distillate. Capturing:

- archetype mode (drives downstream story granularity per Q5)
- active baselines list (a11y/perf/SEO/observability)
- flagged-architecture-deltas status (resolved / outstanding)
- persona scale targets summary
- legacy decisions summary (brownfield only)
- known open issues / risks
- prototype-manifest reference

Conditionally: PRD v(N+1) — emitted if any architecture_delta is resolved as `accept_into_prd` during reconciliation pass. Lightweight amendment via `validate-prd --sections=<list>`.

## Cross-cutting wire-ins

- `editorial-structure` — Step 2 finalisation (breakdown-scope memo structure)

## Method playbook

Tier-1 wire-ins per `phase_7:` section: `problem_solving` (failure_mode_analysis at Step 1 for delta-evaluation); `advanced_elicitation` (on vague delta-impact descriptions).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-30 | Butler (autonomous queue unit #9 Wave 7.2) | Initial `breakdown-entry-sync` skill — NEW under Shape A per Q1 resolution. 3-step workflow: graph-first context load (Step 0), architecture-deltas reconciliation (Step 1 — first real consumer of `validate-prd --sections` path), breakdown-scope memo emit (Step 2). 6th consumer of graph-staleness helper. Mirror of Phase 4 `planning-entry-sync` pattern. Resolves deep-dive findings B1-B3 + B8 + B11 by centralising context load + delta reconciliation in one phase-entry skill. |
