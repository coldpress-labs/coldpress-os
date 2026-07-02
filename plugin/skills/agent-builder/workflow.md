---
workflow_version: "1.0"
output_file: "../../agents/{agent-slug}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Guides creation or editing of agent definitions through: mode selection (create/edit/analyze), definition authoring, and validation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-mode.md](steps/step-01-mode.md) | Select mode and gather agent details |
| 2 | [step-02-author.md](steps/step-02-author.md) | Author or edit the agent definition |
| 3 | [step-03-validate.md](steps/step-03-validate.md) | Validate against schema and update roster |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Agent definition complete and schema-conformant
- Agent roster CSV updated
- No duplicate agent slugs
