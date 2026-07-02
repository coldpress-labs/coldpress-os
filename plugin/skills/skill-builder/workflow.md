---
workflow_version: "1.0"
output_file: "../{category}/{skill-name}/SKILL.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides skill creation through: design (purpose, type, inputs/outputs), definition authoring, step file generation (if workflow type), and validation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-design.md](steps/step-01-design.md) | Design skill purpose, type, and interface |
| 2 | [step-02-author.md](steps/step-02-author.md) | Write SKILL.md and workflow.md |
| 3 | [step-03-steps.md](steps/step-03-steps.md) | Generate step files (for workflow skills) |
| 4 | [step-04-validate.md](steps/step-04-validate.md) | Validate and register in catalog |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- SKILL.md complete and schema-conformant
- workflow.md generated (if workflow type)
- All step files generated (if workflow type)
- Skill catalog CSV updated
