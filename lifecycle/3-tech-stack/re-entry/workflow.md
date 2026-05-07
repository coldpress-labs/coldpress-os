---
workflow_version: "1.0"
output_file: "varies by path chosen"
total_steps: 2
resume_from: "frontmatter"
---

## Overview

Two-step router: surface the 3 valid post-lock paths, then dispatch to the chosen target.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-menu.md](steps/step-01-menu.md) | Present the 3 re-entry options; wait for user choice |
| 2 | [step-02-dispatch.md](steps/step-02-dispatch.md) | Dispatch to the chosen target skill |

## Execution Rules

1. Never re-run the full Phase 3 flow — scope is strictly the chosen path.
2. Halt at the menu until the user picks a path.
3. Do not modify `coldpress.yaml stack_pack` or `tech-stack.md` except through the governance change workflow.

## Completion Criteria

- User selected a path
- Target skill invoked
