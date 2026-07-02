---
step_number: 1
step_name: "Extract Criteria"
step_goal: "Parse and validate acceptance criteria from the story"
halts_for_input: true
next_step: "step-02-design.md"
---

## Goal

Extract all acceptance criteria and validate they are testable.

## Instructions

1. **Read the story file** and extract all acceptance criteria.
2. **Validate format** — each should be in Given/When/Then or equivalent testable format.
3. **Flag ambiguous criteria** that cannot be directly translated to tests.
4. **Present extracted criteria** to user for confirmation.

## User Interaction

"I found **{N}** acceptance criteria. {N} are testable as-is, {N} need clarification. Review?"

## Output

Validated criteria list in frontmatter. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-design.md](step-02-design.md)
