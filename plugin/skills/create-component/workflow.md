---
workflow_version: "1.0"
output_file: "convex/ and src/components/"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Builds a Convex feature through: requirements analysis, schema design, function implementation, and frontend integration.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-design.md](steps/step-01-design.md) | Analyze requirements and design the data model |
| 2 | [step-02-schema.md](steps/step-02-schema.md) | Extend Convex schema with new tables |
| 3 | [step-03-functions.md](steps/step-03-functions.md) | Create queries, mutations, and actions |
| 4 | [step-04-frontend.md](steps/step-04-frontend.md) | Build React component with Convex hooks |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Data model designed and approved
- Schema extended with validators
- CRUD functions implemented with proper auth checks
- Frontend component using real-time Convex hooks
