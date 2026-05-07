---
step_number: 4
step_name: "Validate"
step_goal: "Run all tests and validation checks"
halts_for_input: false
next_step: "step-05-complete.md"
---

## Goal

Ensure everything works and nothing is broken.

## Instructions

1. **Run full test suite** — all unit, integration, and E2E tests.
2. **Run type check** — `tsc --noEmit` or equivalent.
3. **Run lint** — no new violations.
4. **Run build** — project builds successfully.
5. **Verify all acceptance criteria** — walk through each AC and confirm it's satisfied.
6. **If any check fails**, fix the issue and re-validate.

## Output

All checks passing. `step_4_complete: true`

## Navigation

→ Auto-proceed to [step-05-complete.md](step-05-complete.md)
