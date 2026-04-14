---
workflow_version: "1.0"
output_file: "_output/design/ux-design-spec.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Plans UX patterns and design specifications through four phases: context loading, user flow design, wireframe concepts, and specification compilation. Bridges the PRD's requirements with implementable design decisions.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-context.md](steps/step-01-context.md) | Load PRD, understand users and requirements |
| 2 | [step-02-flows.md](steps/step-02-flows.md) | User flows and information architecture |
| 3 | [step-03-wireframes.md](steps/step-03-wireframes.md) | Key screen concepts and interaction patterns |
| 4 | [step-04-spec.md](steps/step-04-spec.md) | Compile UX specification document |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- User personas and journeys understood from PRD
- User flows mapped for all key scenarios
- Information architecture defined
- Key screen concepts described with interaction patterns
- UX specification document compiled and approved
