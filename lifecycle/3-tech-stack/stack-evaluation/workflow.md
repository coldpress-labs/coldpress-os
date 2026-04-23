---
workflow_version: "1.0"
output_file: "_context/planning/adr-{decision}-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Guides technology evaluation through: gathering requirements from context, researching and comparing options, and producing an Architecture Decision Record.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-requirements.md](steps/step-01-requirements.md) | Gather tech requirements from context.md |
| 2 | [step-02-evaluate.md](steps/step-02-evaluate.md) | Research and compare technology options |
| 3 | [step-03-decide.md](steps/step-03-decide.md) | Select technology and write ADR |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Decision area clearly identified and scoped
- At least 2-3 technology options researched and compared
- Trade-offs documented with project-specific context
- ADR written with clear rationale for the chosen technology
