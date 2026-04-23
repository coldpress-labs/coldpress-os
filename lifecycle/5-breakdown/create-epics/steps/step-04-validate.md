---
step_number: 4
step_name: "Validate"
step_goal: "Validate coverage -- every FR mapped, present to user"
halts_for_input: true
next_step: null
---

## Goal

Ensure complete traceability from FRs to epics/stories and get user sign-off.

## Instructions

1. **Build traceability matrix.** Map every FR from the PRD to at least one epic and story.
2. **Identify gaps.** Flag any FR that is not covered by any story.
3. **Identify orphans.** Flag any story that does not trace back to an FR (potential scope creep).
4. **Verify epic ordering.** Confirm no epic depends on a later epic.
5. **Present the full breakdown** to the user:
   - Epic count and story count
   - Traceability matrix summary
   - Any gaps or concerns
6. **Get user approval** before writing the output file.
7. **Write `_context/planning/epics.md`** with the complete breakdown.

## Output

`_context/planning/epics.md` written. Coverage validated. `step_4_complete: true`

## Navigation

Workflow complete. Proceed to `create-stories` to build detailed story context files, or `parallelization-strategy` for dependency analysis.
