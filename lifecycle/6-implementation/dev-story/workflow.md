---
workflow_version: "1.0"
output_file: "_output/implementation/{story-key}.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Implements a story through: story loading, context gathering, red-green-refactor implementation, validation, and completion.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-load.md](steps/step-01-load.md) | Find and load the next ready story |
| 2 | [step-02-context.md](steps/step-02-context.md) | Load project context and developer guardrails |
| 3 | [step-03-implement.md](steps/step-03-implement.md) | Red-green-refactor cycle for each task |
| 4 | [step-04-validate.md](steps/step-04-validate.md) | Run all tests and validation checks |
| 5 | [step-05-complete.md](steps/step-05-complete.md) | Mark story complete and update tracking |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the story file's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed task.
7. **Continue until COMPLETE.** Do not stop for milestones or session boundaries.

## Completion Criteria

- All acceptance criteria satisfied
- All tasks checked off in story file
- All tests passing (no regressions)
- Story file updated with File List, Change Log, Dev Agent Record
- sprint-status.yaml updated to `review`
