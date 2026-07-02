---
step_number: 2
step_name: "Build Workflow"
step_goal: "Generate workflow.md and all step files"
halts_for_input: true
next_step: "step-03-validate.md"
---

## Goal

Produce the complete workflow definition.

## Instructions

1. **Generate workflow.md** with: frontmatter, overview, step index, execution rules, completion criteria.
2. **Generate each step file** with: frontmatter (step_number, step_name, step_goal, halts_for_input, next_step), goal, instructions, user interaction, output, navigation.
3. **For Convert mode:** Read legacy source, map to coldpress-os format, preserve all logic.
4. **For Analyze mode:** Read target workflow, check for missing steps, broken chains, schema violations.
5. **Present all generated files** for review.

## Output

Workflow files drafted. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-validate.md](step-03-validate.md)
