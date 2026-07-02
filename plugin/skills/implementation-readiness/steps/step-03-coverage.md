---
step_number: 3
step_name: "Coverage Validation"
step_goal: "Verify every FR is covered by at least one epic/story"
halts_for_input: false
next_step: "step-04-alignment.md"
---

## Goal

Ensure no requirements fall through the cracks.

## Instructions

1. **Read epics and stories document.**
2. **Map each FR to implementing epic(s) and story(ies).**
3. **Build coverage matrix:** FR → Epic → Story → Status.
4. **Identify gaps:** FRs with no implementing story.
5. **Append findings to report.**

## Output

Coverage matrix complete. `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-alignment.md](step-04-alignment.md)
