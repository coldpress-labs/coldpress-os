---
workflow_version: "1.0"
output_file: "_context/planning/product-evolution-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Plans product evolution through: learnings synthesis, feature prioritization, and roadmap creation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-synthesize.md](steps/step-01-synthesize.md) | Gather learnings from retros, feedback, and market |
| 2 | [step-02-prioritize.md](steps/step-02-prioritize.md) | Prioritize potential features and changes |
| 3 | [step-03-roadmap.md](steps/step-03-roadmap.md) | Create evolution roadmap and recommend next phase |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Learnings synthesized from all sources
- Features prioritized by impact and effort
- Roadmap created with clear next steps
