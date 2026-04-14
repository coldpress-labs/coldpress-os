---
step_number: 4
step_name: "Compile Plan"
step_goal: "Assemble and present the complete test plan"
halts_for_input: true
next_step: "complete"
---

## Goal

Compile all gathered information into a formal test plan document.

## Instructions

1. **Assemble test plan** with sections:
   - Scope and objectives
   - Test strategy (pyramid, types, tools)
   - Coverage matrix
   - Environment requirements
   - Test data requirements
   - Risks and mitigations
   - Entry/exit criteria
   - Schedule and responsibilities

2. **Write to output location.**

3. **Present summary** to user with:
   - Total test cases planned
   - Coverage percentage
   - Estimated effort
   - Key risks

## User Interaction

Present the completed test plan for review and approval.

## Output

Test plan at `_output/testing/test-plan-{scope}.md`. Workflow complete.

## Navigation

→ Workflow complete.
