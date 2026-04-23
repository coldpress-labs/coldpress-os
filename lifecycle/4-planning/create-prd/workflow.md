---
workflow_version: "1.0"
output_file: "_context/planning/prd.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Creates a comprehensive Product Requirements Document through five phases: initialization, product vision, requirements gathering, feature definition, and finalization. Supports create (c), edit (e), and validate (v) modes detected in step 1.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-init.md](steps/step-01-init.md) | Load context, detect mode (create/edit/validate) |
| 2 | [step-02-vision.md](steps/step-02-vision.md) | Product vision and goals |
| 3 | [step-03-requirements.md](steps/step-03-requirements.md) | Functional and non-functional requirements |
| 4 | [step-04-features.md](steps/step-04-features.md) | Feature descriptions with user stories |
| 5 | [step-05-finalize.md](steps/step-05-finalize.md) | Review, validate, write sacred document |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Product vision and goals clearly defined
- All functional requirements documented with acceptance criteria
- Non-functional requirements specified (performance, security, accessibility)
- Features described with user stories and priority levels
- PRD written as sacred document with governance metadata
- User has approved the final PRD
