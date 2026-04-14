---
workflow_version: "1.0"
output_file: "docs/tech-stack.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Guides stack locking through: inventorying all ADRs, writing the consolidated tech-stack.md, and presenting for approval to mark as sacred.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-inventory.md](steps/step-01-inventory.md) | Read all ADRs and consolidate decisions |
| 2 | [step-02-document.md](steps/step-02-document.md) | Write tech-stack.md with all sections |
| 3 | [step-03-lock.md](steps/step-03-lock.md) | Present for approval and mark as sacred |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All existing ADRs read and consolidated
- tech-stack.md covers all sections: frontend, backend, database, auth, hosting, testing, CI/CD
- Document presented to user for review and approval
- tech-stack.md marked as sacred upon approval
