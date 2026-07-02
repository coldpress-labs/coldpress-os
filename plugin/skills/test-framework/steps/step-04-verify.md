---
step_number: 4
step_name: "Verify Setup"
step_goal: "Run all tests and verify the framework is working correctly"
halts_for_input: true
next_step: "complete"
---

## Goal

Verify everything works by running the test suite.

## Instructions

1. **Run unit tests** and verify they pass.
2. **Run E2E tests** (if configured) and verify they pass.
3. **Check coverage report** generates correctly.
4. **Generate setup report** summarizing what was installed, configured, and created.
5. **Present results** to user.

## User Interaction

Show test results and ask if any adjustments are needed.

## Output

Setup report at output location. Workflow complete.

## Navigation

→ Workflow complete.
