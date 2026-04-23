---
workflow_version: "1.0"
output_file: "_context/creative/presentation-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Builds a presentation through: context and audience analysis, narrative arc design, slide-by-slide planning, and final assembly with speaker notes.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-context.md](steps/step-01-context.md) | Define audience, message, and constraints |
| 2 | [step-02-arc.md](steps/step-02-arc.md) | Design the narrative arc and key moments |
| 3 | [step-03-slides.md](steps/step-03-slides.md) | Plan individual slides with content and visuals |
| 4 | [step-04-finalize.md](steps/step-04-finalize.md) | Add speaker notes and finalize |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Context and message defined
- Narrative arc designed
- All slides planned with content and visual direction
- Speaker notes written for each slide
