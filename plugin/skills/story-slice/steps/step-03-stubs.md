---
step_number: 3
step_name: "Stubs"
step_goal: "Invoke acceptance-stubs per story — red by construction"
halts_for_input: false
next_step: "step-04-validate.md"
---

## Goal

Give every story its **red acceptance stubs before implementation** — the tests
`dev-story` will turn green (and `test-integrity` will forbid weakening).

## Instructions

1. For each `ST-*.md`, invoke the **`acceptance-stubs`** skill: generate unit-test
   skeletons + Playwright spec skeletons from the story's acceptance criteria,
   **red by construction** (they fail because the feature doesn't exist yet).
2. **UI stories:** the stubs include computed-style assertions referencing
   `tokens.json` (font/color/spacing) and the story's styleguide components.
3. Write `ST-<n>-<slug>.tests.md` (or the stack pack's test-file convention)
   alongside the story; record the stub manifest in the story file.

## Output

Red acceptance stubs present for every story. → [step-04-validate.md](step-04-validate.md).
