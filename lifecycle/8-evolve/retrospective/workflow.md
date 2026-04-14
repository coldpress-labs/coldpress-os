---
workflow_version: "1.0"
output_file: "_output/tracking/retro-epic-{N}-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Facilitates retrospective through: epic discovery and context loading, reflective dialogue, and action planning.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-discover.md](steps/step-01-discover.md) | Find completed epic and load context |
| 2 | [step-02-reflect.md](steps/step-02-reflect.md) | Facilitate reflective dialogue |
| 3 | [step-03-plan.md](steps/step-03-plan.md) | Extract action items and prepare for next epic |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Epic identified and context loaded
- Reflective dialogue completed
- Lessons learned documented
- Action items defined for next iteration
