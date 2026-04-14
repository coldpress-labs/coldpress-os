---
workflow_version: "1.0"
output_file: "_output/reviews/code-review-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

The code review workflow orchestrates three parallel review layers — blind adversarial, edge-case hunting, and acceptance auditing — then triages and deduplicates findings into actionable categories for the developer.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-gather-context.md](steps/step-01-gather-context.md) | Detect review intent and gather diff + context |
| 2 | [step-02-review.md](steps/step-02-review.md) | Run parallel review layers |
| 3 | [step-03-triage.md](steps/step-03-triage.md) | Normalize, deduplicate, and classify findings |
| 4 | [step-04-present.md](steps/step-04-present.md) | Present findings and resolve with user |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All three review layers executed (or gracefully failed)
- Findings triaged into categories
- User has resolved all `decision_needed` items
- Report written to output location
