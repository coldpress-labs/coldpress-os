---
workflow_version: "1.0"
output_file: "_context/sacred/architecture.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Creates the technical architecture document through four phases: context loading, system design, architecture decisions, and finalization. Produces a sacred document that ensures AI agent consistency in implementation decisions.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-context.md](steps/step-01-context.md) | Load PRD + tech-stack, understand requirements |
| 2 | [step-02-design.md](steps/step-02-design.md) | System architecture, data model, API design |
| 3 | [step-03-decisions.md](steps/step-03-decisions.md) | Key ADRs inline, patterns, anti-patterns |
| 4 | [step-04-finalize.md](steps/step-04-finalize.md) | Review, write sacred document |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- System architecture defined (components, boundaries, communication)
- Data model designed (entities, relationships, storage strategy)
- API design specified (endpoints, contracts, patterns)
- Key architecture decisions recorded as inline ADRs
- Patterns and anti-patterns documented
- Architecture document written as sacred document with governance metadata
- User has approved the final architecture
