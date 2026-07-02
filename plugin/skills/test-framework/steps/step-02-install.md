---
step_number: 2
step_name: "Install & Configure"
step_goal: "Install test framework and create configuration files"
halts_for_input: true
next_step: "step-03-examples.md"
---

## Goal

Install the selected test framework and generate all necessary configuration.

## Instructions

1. **Install dependencies** using the project's package manager.
2. **Create config files** (vitest.config.ts, playwright.config.ts, etc.).
3. **Add npm scripts** for test, test:watch, test:coverage, test:e2e.
4. **Create test directory structure** matching project conventions.
5. **Present changes** before applying.

## User Interaction

Present the list of packages and config changes. Confirm before installing.

## Output

Framework installed and configured. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-examples.md](step-03-examples.md)
