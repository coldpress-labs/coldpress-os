---
step_number: 3
step_name: "Generate Tests"
step_goal: "Write executable test files from the designed test cases"
halts_for_input: false
next_step: "step-04-verify-fail.md"
---

## Goal

Generate actual test code from the approved test case designs.

## Instructions

1. **Generate test files** using the project's test framework and conventions.
2. **Use semantic locators** for UI tests (roles, labels, text — not CSS selectors).
3. **Include clear test descriptions** that map back to acceptance criteria.
4. **Keep tests independent** — no shared state or order dependencies.
5. **Write tests that SHOULD fail** — they test behavior that doesn't exist yet.

## Output

Test files written to project. `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-verify-fail.md](step-04-verify-fail.md)
