---
workflow_version: "1.0"
output_file: "project root"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Sets up a Convex project through: frontend framework selection, Convex initialization, schema and function scaffolding, and verification.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-framework.md](steps/step-01-framework.md) | Select frontend framework and initialize project |
| 2 | [step-02-convex-init.md](steps/step-02-convex-init.md) | Initialize Convex and configure |
| 3 | [step-03-scaffold.md](steps/step-03-scaffold.md) | Create schema, functions, and example code |
| 4 | [step-04-verify.md](steps/step-04-verify.md) | Verify setup and run dev server |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Frontend project initialized
- Convex configured and connected
- Schema and initial functions created
- Dev server runs successfully
