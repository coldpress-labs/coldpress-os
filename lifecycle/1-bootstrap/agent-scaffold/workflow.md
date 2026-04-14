---
workflow_version: "1.0"
output_file: ".claude/SYSTEM.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Generates the project's .claude/ directory by: reading coldpress-os skill catalog, generating thin wrapper files, and configuring Butler's SYSTEM.md directive.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-scan.md](steps/step-01-scan.md) | Scan coldpress-os for all available skills |
| 2 | [step-02-wrappers.md](steps/step-02-wrappers.md) | Generate thin skill wrappers |
| 3 | [step-03-butler.md](steps/step-03-butler.md) | Generate Butler SYSTEM.md directive |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All skill wrappers generated in `.claude/skills/`
- Butler SYSTEM.md generated with project-specific routing
- `.claude/settings.json` created with permissions
