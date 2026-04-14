---
workflow_version: "1.0"
output_file: "_output/planning/product-brief-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Creates a concise 1-2 page executive product brief through four phases: understanding intent, contextual discovery, drafting, and review. Supports Guided (default), Autonomous (-A), and Yolo (--yolo) activation modes.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-intent.md](steps/step-01-intent.md) | Understand why user is here, detect brief type |
| 2 | [step-02-discover.md](steps/step-02-discover.md) | Contextual discovery from existing docs + user interview |
| 3 | [step-03-draft.md](steps/step-03-draft.md) | Draft the product brief |
| 4 | [step-04-review.md](steps/step-04-review.md) | Review, refine, finalize, offer distillate |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Product vision and strategy clearly articulated
- Target users and value proposition defined
- Key features and success metrics captured
- Brief is 1-2 pages, executive-readable
- User has approved the final brief
