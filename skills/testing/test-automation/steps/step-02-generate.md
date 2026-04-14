---
step_number: 2
step_name: "Generate Tests"
step_goal: "Write test files for identified coverage gaps"
halts_for_input: false
next_step: "step-03-run.md"
---

## Goal

Generate tests that cover the identified gaps.

## Instructions

1. **Generate API tests** (if applicable): status codes, response structure, happy paths, error cases.
2. **Generate E2E tests** (if UI exists): user workflows, form interactions, navigation.
3. **Generate unit tests**: pure function logic, edge cases, error handling.
4. **Follow project conventions** for file naming, location, and patterns.
5. **Use semantic locators** (roles, labels, text) — never CSS selectors.
6. **Keep tests simple** — standard framework APIs, no over-engineering.

## Output

Test files written to project. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-run.md](step-03-run.md)
