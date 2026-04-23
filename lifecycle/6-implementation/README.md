---
phase: 6
name: "Implementation"
description: "Build, test, and review — stories execute inside waves, reviews run per-story, QA runs per-wave"
prerequisites:
  - "Phase 5 (Breakdown) complete"
  - "Implementation readiness: READY (gate passed in Phase 5)"
  - "`_context/tracking/sprint-status.yaml` exists with the current sprint's epic + story list"
  - "`_context/sacred/pert-chart.md` defines the wave assignments"
outputs:
  - "Implemented code in `sandbox/src/` (or the project-appropriate tree)"
  - "Test suites covering every shipped story"
  - "Per-story code-review reports at `_context/audit/code-review-{date}.md`"
  - "Per-wave QA reports at `_context/audit/reviews/*` and `_context/testing/*`"
next_phase: "7-deployment"
---

# Phase 6: Implementation

> Execute stories inside waves. Reviews run per-story; QA runs per-wave. Wave-close is the gate, not story-close.

## Entry conditions

Phase 6 starts when **all four** prerequisites are satisfied:

1. Phase 5 (Breakdown) marked complete — PERT chart approved.
2. `implementation-readiness` gate passed — the QA-authored READY signal that stories have enough acceptance-criteria detail, test-data plan, and rollback strategy.
3. `_context/tracking/sprint-status.yaml` populated with epic + story IDs for the current sprint.
4. `_context/sacred/pert-chart.md` wave assignments agreed.

If any of these are missing, loop back to Phase 5 rather than improvising. Implementation without a wave plan is the #1 way Phase-6 work slides.

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [wave-orchestration](wave-orchestration/) | workflow | scrum-master | **Wraps the phase.** Dispatches per-wave — opens the wave, runs stories in parallel, runs per-wave QA, closes the wave against exit conditions. |
| [dev-story](dev-story/) | workflow | developer | Execute a single story red-green-refactor. Invoked per-story inside a wave. |
| [quick-dev](quick-dev/) | workflow | developer | Fast path for bug-fix / small-feature work that doesn't need the full ceremony. |
| [code-review](code-review/) | router | qa | → `skills/reviews/code-review/` — runs **per story**, after dev-story. |
| [qa-automation](qa-automation/) | router | qa | → `skills/testing/test-automation/` — runs **per wave**, after all stories pass review. |
| [test-design](test-design/) | router | qa | → `skills/testing/test-design/` — authored up-front for the sprint, referenced per-story. |
| [test-framework](test-framework/) | router | qa | → `skills/testing/test-framework/` — one-time setup, reused thereafter. |
| [atdd](atdd/) | router | qa | → `skills/testing/atdd/` — used when acceptance criteria drive spec-first test writing. |
| [ci-pipeline](ci-pipeline/) | router | qa | → `skills/testing/ci-pipeline/` — wires the tests into CI. |

## Corrected flow — wave-orchestration wraps stories, doesn't sequence after them

Earlier versions of this README showed a linear `dev-story → code-review → qa-automation → wave-orchestration` flow. That's wrong — wave-orchestration is **the outer loop**, not the last step. Correct shape:

```
wave-orchestration (opens Wave N)
  │
  ├─ parallel: [ dev-story → code-review ] per story in Wave N
  │                                        (per-story QA review is fast-feedback)
  │
  ├─ qa-automation across the whole wave  (per-wave integration + regression)
  │
  └─ wave-close gate  → next wave or Phase 7
```

Per-story `code-review` gives developers fast feedback on individual changes. Per-wave `qa-automation` catches cross-story regressions that only emerge when multiple stories are integrated. Treating them as the same cadence misses the trade-off.

## Exit conditions

Phase 6 is complete when all of:

1. **All stories in the current sprint are green in `sprint-status.yaml`.** Status field = `done` for every story ID.
2. **Test-coverage threshold met.** Define per project in `coldpress.yaml` (e.g., 80% branch coverage on the modules touched); verified by `test-automation` + `traceability`.
3. **QA sign-off.** `@qa` reviews the wave-close report and marks the phase ready for Phase 7. No hand-waving — if coverage is short or a story regresses, the wave doesn't close.

When Wave 5 (§5.0 Phase-gate JSON protocol) lands, these exit conditions move from prose to a machine-checkable JSON contract — `wave-orchestration` runs the contract check before emitting the exit signal.

## Creative skills typically useful in this phase

Per Wave 4 §4.10, creative skills are cross-cutting (phase-agnostic). When Phase 6 needs ideation — typically for problem-solving around a novel bug or architectural question — these are available via `@analyst` or `@developer`:

- [`problem-solving`](../../skills/creative/problem-solving/) — 29+ frameworks for breaking down a novel issue.
- [`brainstorming`](../../skills/creative/brainstorming/) — 60+ techniques when the right approach isn't obvious.

They aren't Phase-6-owned — just typically useful when implementation hits a non-obvious wall.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-23 | Cadbury-hq | Flesh-out per Wave 4 §4.3. Added entry + exit conditions, QA cadence prose (per-story vs per-wave), inverted the flow diagram so wave-orchestration wraps stories rather than sequencing after them. Added "creative skills typically useful" section per §4.10 cross-cutting relocation. |
| 1.0 | 2026-04-13 | Alfred | Initial Phase 6 definition. |
