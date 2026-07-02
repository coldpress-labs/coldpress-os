---
step_number: 3
step_name: "Run & Fix"
step_goal: "Execute generated tests and fix any failures"
halts_for_input: false
next_step: "step-04-report.md"
---

## Goal

Verify all generated tests pass.

## Instructions

1. **Run all generated tests.**
2. **Fix failures** — adjust assertions, fix imports, correct locators.
3. **Rerun until all pass.**
4. **Validate tests are meaningful** — each tests real behavior, not implementation details.

## Output

All tests passing. `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-report.md](step-04-report.md)
