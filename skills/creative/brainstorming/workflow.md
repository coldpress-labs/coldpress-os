---
workflow_version: "1.0"
output_file: "_output/creative/brainstorm-{topic}-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides an interactive brainstorming session through setup, technique selection, facilitated idea generation (target: 100+ ideas), and organization of results into themes and priorities.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-setup.md](steps/step-01-setup.md) | Session setup and context gathering |
| 2 | [step-02-technique.md](steps/step-02-technique.md) | Select brainstorming techniques |
| 3 | [step-03-generate.md](steps/step-03-generate.md) | Interactive idea generation |
| 4 | [step-04-organize.md](steps/step-04-organize.md) | Theme identification and prioritization |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Anti-Bias Protocol

Consciously pivot domains every ~10 ideas to prevent anchoring. If all ideas cluster in one area, deliberately introduce a technique from a different category to force divergent thinking.

## Completion Criteria

- Session topic defined and techniques selected
- Minimum 100 ideas generated (or user explicitly stops early)
- Ideas organized into themes
- Top priorities identified with action items
