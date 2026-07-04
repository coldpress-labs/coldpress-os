---
step_number: 5
step_name: "Tracking"
step_goal: "Generate the initial sprint-status tracking file from stories × wave assignment"
halts_for_input: false
next_step: null
---

## Goal

Emit the initial **tracking file** so Phase 8 `dev-story`, `operate-loop` (P10),
and `retrospective` (P11) have a live status surface. (Absorbs the mechanical
status-file generation formerly done by `sprint-planning` / the old Steps 4-6.)

## Instructions

1. From the sliced stories × the computed wave assignment, write
   `_context/tracking/sprint-status.yaml`:
   - `metadata` — generated date, project, story location, wave count.
   - `development_status` — every story with its wave, `owns`, risk, estimate, and
     status `ready-for-dev`.
2. **Validate** — every story is assigned to exactly one wave; no story orphaned
   (this is Phase 7's `sprint-status-validated` exit check).
3. Report: story count, wave count, critical-path length, risk distribution.

## Output

`sprint-status.yaml` written + validated. Phase 7 hands off to
`implementation-readiness` (the P7 exit gate), then Phase 8.
