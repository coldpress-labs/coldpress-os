---
workflow_version: "1.0"
output_file: "_context/tracking/intake-{date}.md"
total_steps: 6
resume_from: "frontmatter"
re_runnable: true
---

## Overview

Six steps, each writing one output. The user controls pacing — Butler halts for input at every step that asks a question, so the flow can be paused and resumed across sessions.

## Step Index

| Step | File | Output |
|------|------|--------|
| 1 | [step-01-material-solicitation.md](steps/step-01-material-solicitation.md) | `_input/` subfolders walked; URL fetches into `_input/reference/`; material inventory appended to intake report |
| 2 | [step-02-shape-determination.md](steps/step-02-shape-determination.md) | `project_shape` written to `.coldpress/local-config.yaml` |
| 3 | [step-03-intent-seed.md](steps/step-03-intent-seed.md) | `_context/sacred/context.md` created with frontmatter + `status: seed` + one-line intent |
| 4 | [step-04-working-mode.md](steps/step-04-working-mode.md) | `user.preferred_ides`, `user.cadence`, `user.team_shape`, `butler.display_name` written back to `coldpress.yaml` |
| 5 | [step-05-graph-prime.md](steps/step-05-graph-prime.md) | `.coldpress/graph/graph.json` (on success) or `needs_graph_rebuild` flag (on failure) |
| 6 | [step-06-gate-and-route.md](steps/step-06-gate-and-route.md) | Phase 1 gate evaluation; handoff to Phase 2 `pre-project-interview` on pass |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Mark partial completion before work.** Every step's first action is `markStepStart(projectRoot, step_id)`. Clean exit calls `clearStepMarker(projectRoot)`.
3. **Re-runnable entry is Step 1.** Re-invoking `intake` from a later phase (to ingest new material) re-enters at Step 1 and appends to the current day's intake report. Steps 2-6 are skipped on re-run; their state is preserved.
4. **Halt at menus.** When a step presents options, wait for user input. Don't assume a default past the first question of each step.
5. **Graph prime is warn-not-block.** Step 5 failure sets `needs_graph_rebuild` + `graph_rebuild_error` and continues to Step 6. Orient retries on next session.
6. **Gate before Phase 2.** Step 6 runs `evaluate-phase-gate` against `lifecycle/1-bootstrap/gate.json`. On pass, hand off. On warn, surface + continue (warn-severity checks don't block). On block, halt and surface remedies.
7. **Never regenerate sacred docs.** Step 3 only *seeds* `context.md`. Later Phase 2 skills fill it in; modifying a filled context.md requires governance (`governance/sacred-docs.md`).

## Re-entry rules

- Re-running `intake` in a fresh session loads Step 1 (material solicitation). Steps 2-6 are skipped.
- Re-running `intake` from an active Phase 2+ session: allowed, treated as "new material landed, re-index." Appends to `intake-{date}.md`; does not corrupt phase state. Graph rebuild is triggered automatically at the end.
- Resume (via orient Step 1 `partial_completion` marker) jumps directly to the recorded step; prior steps are treated as complete.

## Completion Criteria

- All 6 steps exited cleanly (or steps 2-6 skipped on re-run).
- `context.md` exists with valid frontmatter + `status: seed`.
- `coldpress.yaml` has `user.preferred_ides`, `user.cadence`, `user.team_shape` filled (defaults OK if user didn't customise).
- `.coldpress/graph/graph.json` exists OR `needs_graph_rebuild: true` is recorded.
- Phase 1 gate evaluates to `pass` or `pass-with-warnings`.
- Butler positioned to dispatch `@analyst` for Phase 2 `pre-project-interview`.
