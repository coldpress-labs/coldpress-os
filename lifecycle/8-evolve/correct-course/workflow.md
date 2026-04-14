---
workflow_version: "1.0"
output_file: "_output/planning/sprint-change-proposal-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Manages course corrections through: change trigger analysis, impact assessment, and change proposal generation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-trigger.md](steps/step-01-trigger.md) | Understand the change trigger |
| 2 | [step-02-impact.md](steps/step-02-impact.md) | Analyze impact across all artifacts |
| 3 | [step-03-propose.md](steps/step-03-propose.md) | Generate Sprint Change Proposal |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Change trigger clearly documented
- Impact analyzed across PRD, epics, architecture, UX
- Specific change proposals drafted with before/after
- Implementation handoff categorized (minor/moderate/major)
