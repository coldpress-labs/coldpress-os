---
workflow_version: "1.0"
output_file: "_output/tracking/deploy-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Deploys through: target selection, deployment execution, and verification.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-target.md](steps/step-01-target.md) | Select deployment target and confirm |
| 2 | [step-02-execute.md](steps/step-02-execute.md) | Execute deployment |
| 3 | [step-03-verify.md](steps/step-03-verify.md) | Verify deployment and log results |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the deployment log.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Deployment target confirmed
- Deployment executed successfully
- Post-deploy verification passed
- Deployment logged
