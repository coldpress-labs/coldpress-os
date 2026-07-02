---
workflow_version: "2.0"
output_file: "_context/tracking/intake-{date}.md"
total_steps: 13
resume_from: "frontmatter"
re_runnable: true
---

## Overview

Butler's entire Phase 1: check in, collect material, classify shape, and produce a fully authored `context.md` — one continuous skill, thirteen steps, each writing (or checking) one output. The user controls pacing — Butler halts for input at every step that asks a question, so the flow can be paused and resumed across sessions.

## Step Index

| Step | File | Output |
|------|------|--------|
| 1 | [step-01-mode-detect.md](steps/step-01-mode-detect.md) | Session mode classified (first-session / re-entry / resume) |
| 2 | [step-02-greeting.md](steps/step-02-greeting.md) | First-session greeting (skipped on re-entry/resume) |
| 3 | [step-03-sanity-check.md](steps/step-03-sanity-check.md) | Scaffold health report appended to the intake report |
| 4 | [step-04-lifecycle-intro.md](steps/step-04-lifecycle-intro.md) | Lifecycle preview shown or explicitly skipped |
| 5 | [step-05-material-solicitation.md](steps/step-05-material-solicitation.md) | `_input/` subfolders walked; URL fetches into `_input/reference/`; material inventory appended to intake report |
| 6 | [step-06-shape-determination.md](steps/step-06-shape-determination.md) | `project_shape` written to `.coldpress/local-config.yaml` |
| 7 | [step-07-intent-seed.md](steps/step-07-intent-seed.md) | `_context/sacred/context.md` created with frontmatter + `status: seed` + one-line intent |
| 8 | [step-08-vision.md](steps/step-08-vision.md) | Vision section (problem, scope, success criteria) drafted |
| 9 | [step-09-users.md](steps/step-09-users.md) | Users section (user types, value prop, brownfield prior-user notes) drafted |
| 10 | [step-10-constraints.md](steps/step-10-constraints.md) | Constraints section (technical, non-technical 5-question checklist, brownfield carry-over, business rules) drafted |
| 11 | [step-11-synthesize.md](steps/step-11-synthesize.md) | `_context/sacred/context.md` promoted `seed` → `authored`, schema-validated, sacred-signed-off |
| 12 | [step-12-working-mode.md](steps/step-12-working-mode.md) | `user.preferred_ides`, `user.cadence`, `user.team_shape`, `butler.display_name` written back to `coldpress.yaml` |
| 13 | [step-13-gate-and-route.md](steps/step-13-gate-and-route.md) | Phase 1 gate evaluation; handoff to Phase 2 `research` on pass |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Mark partial completion before work.** Every step's first action is `markStepStart(projectRoot, step_id)`. Clean exit calls `clearStepMarker(projectRoot)`.
3. **Respect the mode (Step 1).** `re-entry` skips Steps 2 and 4. `resume` skips directly to the recorded `step_id`.
4. **Re-runnable entry is Step 5.** Re-invoking `intake` from a later phase (to ingest new material) re-enters at Step 5 and appends to the current day's intake report. Steps 6-13 are skipped on re-run; their state is preserved.
5. **Halt at menus.** When a step presents options, wait for user input. Don't assume a default past the first question of each step.
6. **Never regenerate sacred docs.** Step 7 only *seeds* `context.md`; Step 11 promotes it to `authored` after Steps 8-10 fill it in. Modifying an already-authored context.md requires the `sacred-change` skill.
7. **Gate before Phase 2.** Step 13 runs `evaluate-phase-gate` against `lifecycle/1-bootstrap/gate.json`. On pass, hand off. On warn, surface + continue (warn-severity checks don't block). On block, halt and surface remedies.

## Re-entry rules

- Re-running `intake` in a fresh session loads Step 1 (mode detect), which routes back to Step 5 (material solicitation) once the scaffold check confirms Phase 1 is otherwise complete. Steps 6-13 are skipped.
- Re-running `intake` from an active Phase 2+ session: allowed, treated as "new material landed, re-index." Appends to `intake-{date}.md`; does not corrupt phase state.
- Resume (via Step 1's `partial_completion` marker) jumps directly to the recorded step; prior steps are treated as complete.

## Completion Criteria

- All 13 steps exited cleanly (or Steps 6-13 skipped on re-run).
- `context.md` exists with valid frontmatter and `status: authored` (not merely `seed`).
- `coldpress.yaml` has `user.preferred_ides`, `user.cadence`, `user.team_shape` filled (defaults OK if user didn't customise).
- Phase 1 gate evaluates to `pass` or `pass-with-warnings`.
- Butler positioned to dispatch `@analyst` for Phase 2 `research`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial 6-step intake workflow for the npm-era Phase 1. |
| 2.0 | 2026-07-02 | Butler | Absorbed `orient` (4 steps, now 1-4) and `pre-project-interview` (4 steps, now 8-11) per §8 item 6; dropped the dead `coldpress graph rebuild` step (WS0 §8 item 1 removed the CLI verb, no replacement exists). Total steps 6 → 13. Re-runnable entry point moved from Step 1 to Step 5 accordingly (WS5-B). |
