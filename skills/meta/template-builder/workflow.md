---
workflow_version: "1.0"
output_file: "../../authoring/{category}/{template-name}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Guides template creation through: purpose definition, template authoring with required sections, and validation against conventions.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-design.md](steps/step-01-design.md) | Define template purpose and structure |
| 2 | [step-02-author.md](steps/step-02-author.md) | Write the template with placeholder content |
| 3 | [step-03-validate.md](steps/step-03-validate.md) | Validate and write to templates directory |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Template purpose and audience defined
- All sections authored with appropriate placeholders
- Template follows framework conventions
- Written to correct templates directory
