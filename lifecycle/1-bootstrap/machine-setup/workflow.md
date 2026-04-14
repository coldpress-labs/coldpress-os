---
workflow_version: "1.0"
output_file: "_output/tracking/machine-setup-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Verifies the developer's machine has all prerequisites for coldpress-os development. Checks core tools, stack-specific tools, and git configuration. Produces a pass/fail report with installation instructions for anything missing.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-core-tools.md](steps/step-01-core-tools.md) | Verify Node.js, package manager, git, Claude Code |
| 2 | [step-02-stack-tools.md](steps/step-02-stack-tools.md) | Verify stack-specific tools from coldpress.yaml |
| 3 | [step-03-report.md](steps/step-03-report.md) | Generate environment report and next steps |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All core tools verified (present and correct version)
- Stack-specific tools verified (if coldpress.yaml specifies a stack pack)
- Git configured with user identity
- Environment report written
- Any missing tools flagged with installation instructions
