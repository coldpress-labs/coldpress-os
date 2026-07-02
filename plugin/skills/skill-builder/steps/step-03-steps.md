---
step_number: 3
step_name: "Generate Steps"
step_goal: "Create step files for workflow-type skills"
halts_for_input: true
next_step: "step-04-validate.md"
---

## Goal

Generate all step files for workflow skills (skip for simple/reference types).

## Instructions

1. **If simple or reference type:** Skip to next step.
2. **For workflow type:** Generate each step file with:
   - Required frontmatter (step_number, step_name, step_goal, halts_for_input, next_step)
   - Goal, Instructions, User Interaction, Output, Navigation sections
3. **Present step files** for review.

## Output

Step files written. `step_3_complete: true`

## Navigation

→ Proceed to [step-04-validate.md](step-04-validate.md)
