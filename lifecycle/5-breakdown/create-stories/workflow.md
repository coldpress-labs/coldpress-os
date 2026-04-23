---
workflow_version: "1.0"
output_file: "_context/implementation/{story-key}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides the creation of comprehensive story context files through: story selection, exhaustive artifact analysis, developer context building, and finalization with sprint-status update.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-select.md](steps/step-01-select.md) | Determine target story from sprint-status or user input |
| 2 | [step-02-analyze.md](steps/step-02-analyze.md) | Exhaustive artifact analysis for the target story |
| 3 | [step-03-context.md](steps/step-03-context.md) | Build developer context with technical specifics |
| 4 | [step-04-finalize.md](steps/step-04-finalize.md) | Write story file, update sprint-status to ready-for-dev |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Target story identified and confirmed
- All project artifacts analyzed for relevant context
- Developer context file written with technical specifics, guardrails, and anti-patterns
- sprint-status.yaml updated to `ready-for-dev` for the story
