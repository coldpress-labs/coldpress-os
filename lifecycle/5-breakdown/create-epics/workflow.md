---
workflow_version: "1.0"
output_file: "_output/planning/epics.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides the breakdown of PRD requirements into user-value-focused epics and stories through: prerequisite validation, requirement decomposition, story creation, and coverage validation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-prerequisites.md](steps/step-01-prerequisites.md) | Validate PRD and architecture exist, load them |
| 2 | [step-02-decompose.md](steps/step-02-decompose.md) | Break FRs into epics organized by user value |
| 3 | [step-03-stories.md](steps/step-03-stories.md) | Create stories per epic with Given/When/Then acceptance criteria |
| 4 | [step-04-validate.md](steps/step-04-validate.md) | Validate coverage and present to user |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All PRD functional requirements mapped to epics
- Each epic has clear acceptance criteria
- Each epic has stories with Given/When/Then criteria
- Epic ordering respects dependency constraints (N never depends on N+1)
- User has validated the breakdown
