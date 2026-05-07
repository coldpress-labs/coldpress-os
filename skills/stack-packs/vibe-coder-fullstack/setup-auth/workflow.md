---
workflow_version: "1.0"
output_file: "convex/auth.config.ts"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Sets up Convex auth through: provider selection, backend auth configuration, protected function patterns, and frontend auth flow integration.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-provider.md](steps/step-01-provider.md) | Select and configure auth provider |
| 2 | [step-02-backend.md](steps/step-02-backend.md) | Configure Convex auth middleware |
| 3 | [step-03-functions.md](steps/step-03-functions.md) | Create authenticated function patterns |
| 4 | [step-04-frontend.md](steps/step-04-frontend.md) | Implement frontend auth flow |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Auth provider configured with API keys
- Convex auth middleware set up
- Example authenticated queries and mutations
- Frontend login/logout flow working
