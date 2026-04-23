---
workflow_version: "1.0"
output_file: "_context/ops/convex-migration-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Plans safe Convex schema migrations through: change analysis, migration strategy, and execution guidance.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-analyze.md](steps/step-01-analyze.md) | Analyze current schema and desired changes |
| 2 | [step-02-plan.md](steps/step-02-plan.md) | Create safe migration strategy |
| 3 | [step-03-execute.md](steps/step-03-execute.md) | Guide migration execution |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Schema changes analyzed for safety
- Migration strategy defined (additive, multi-step, or backfill)
- Migration executed or execution plan documented
