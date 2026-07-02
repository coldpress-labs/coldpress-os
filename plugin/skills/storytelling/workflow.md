---
workflow_version: "1.0"
output_file: "_context/planning/creative/story-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides narrative creation through: audience and message definition, story type selection, narrative drafting, and polish/refinement.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-context.md](steps/step-01-context.md) | Define audience, message, and purpose |
| 2 | [step-02-structure.md](steps/step-02-structure.md) | Select story type and build narrative structure |
| 3 | [step-03-draft.md](steps/step-03-draft.md) | Draft the narrative |
| 4 | [step-04-polish.md](steps/step-04-polish.md) | Refine and finalize |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Audience and message clearly defined
- Story type selected and structure outlined
- Full narrative draft produced
- Final version polished and approved
