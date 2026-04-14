---
workflow_version: "1.0"
output_file: "_output/implementation/spec-wip.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Rapid development through: intent clarification and scoping, implementation, and validation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-clarify.md](steps/step-01-clarify.md) | Clarify intent, scope, and write spec |
| 2 | [step-02-implement.md](steps/step-02-implement.md) | Implement the spec |
| 3 | [step-03-validate.md](steps/step-03-validate.md) | Test and validate |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the spec file's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Single-goal spec written and approved
- Implementation complete with tests
- All validation checks passing
