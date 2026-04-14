---
workflow_version: "1.0"
output_file: "coldpress.yaml"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Initializes a new coldpress-os project through: project details gathering, directory creation, coldpress-os submodule installation, and configuration generation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-gather.md](steps/step-01-gather.md) | Gather project details from user |
| 2 | [step-02-scaffold.md](steps/step-02-scaffold.md) | Create directory structure from template |
| 3 | [step-03-submodule.md](steps/step-03-submodule.md) | Install coldpress-os as git submodule |
| 4 | [step-04-config.md](steps/step-04-config.md) | Generate coldpress.yaml and verify |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Project directory created with correct structure
- coldpress-os installed as git submodule
- coldpress.yaml generated with all project details
- Initial git commit created
