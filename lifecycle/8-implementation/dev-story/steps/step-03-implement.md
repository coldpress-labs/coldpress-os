---
step_number: 3
step_name: "Implement"
step_goal: "Execute red-green-refactor for each task until all ACs are satisfied"
halts_for_input: false
next_step: "step-04-validate.md"
---

## Goal

Implement the story using TDD.

## Instructions

For **each task** in the story:

1. **RED:** Write failing test(s) that verify the acceptance criteria.
2. **GREEN:** Implement minimal code to make tests pass.
3. **REFACTOR:** Improve code quality while keeping tests green.
4. **Check task off** in story file only when fully complete.
5. **Update File List** with all changed/created files.
6. **Update Change Log** with summary of changes.

**Critical rules:**
- Do NOT mark a task complete unless it genuinely passes all its tests.
- Do NOT stop between tasks — continue through all tasks.
- Follow guardrails from Step 2 — use specified libraries, follow patterns.
- Check for regressions after each task.

## Output

All tasks implemented and checked off. `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-validate.md](step-04-validate.md)
