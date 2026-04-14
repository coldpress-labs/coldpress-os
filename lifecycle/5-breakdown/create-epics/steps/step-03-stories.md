---
step_number: 3
step_name: "Stories"
step_goal: "Create stories per epic with Given/When/Then acceptance criteria"
halts_for_input: true
next_step: "step-04-validate.md"
---

## Goal

Decompose each epic into independently completable stories with testable acceptance criteria.

## Instructions

1. **For each epic**, break it into stories that each deliver a testable slice of value.
2. **Each story must be independently completable.** It should not require another story in the same epic to be done first (unless explicitly noted as a dependency).
3. **Write acceptance criteria** in Given/When/Then format:
   - **Given** [precondition]
   - **When** [action]
   - **Then** [expected result]
4. **Assign story keys** using the pattern: `E{epic_number}-S{story_number}` (e.g., E1-S1, E1-S2, E2-S1).
5. **Estimate complexity** for each story: Small / Medium / Large.
6. **Present stories to user** for each epic before moving to the next.

## Output

All epics populated with stories, acceptance criteria, and complexity estimates. `step_3_complete: true`

## Navigation

-> Proceed to [step-04-validate.md](step-04-validate.md)
