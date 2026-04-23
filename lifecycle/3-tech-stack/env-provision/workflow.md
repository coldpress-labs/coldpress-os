---
workflow_version: "1.0"
output_file: "project root (configured environment)"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides development environment setup through: reading the locked stack, installing dependencies, configuring tooling, and verifying everything works.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-read-stack.md](steps/step-01-read-stack.md) | Read tech-stack.md for technology choices |
| 2 | [step-02-install.md](steps/step-02-install.md) | Install all dependencies |
| 3 | [step-03-configure.md](steps/step-03-configure.md) | Configure linting, formatting, git hooks, editor |
| 4 | [step-04-verify.md](steps/step-04-verify.md) | Run build/lint/test to confirm setup works |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All dependencies from tech-stack.md installed
- Linting and formatting configured and working
- Git hooks installed (pre-commit at minimum)
- .env template created with required variables documented
- Editor settings configured (.vscode/settings.json or equivalent)
- Build, lint, and test commands all pass successfully
