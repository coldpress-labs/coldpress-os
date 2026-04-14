---
workflow_version: "1.0"
output_file: "_output/ops/ci-cd-setup-{date}.md"
total_steps: 6
resume_from: "frontmatter"
---

## Overview

Generates a complete CI/CD pipeline by detecting the project stack, determining pipeline strategy, generating configuration files, adding release automation, creating rollback procedures, and validating the output.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-detect-stack.md](steps/step-01-detect-stack.md) | Detect project tech stack and build tooling |
| 2 | [step-02-pipeline-strategy.md](steps/step-02-pipeline-strategy.md) | Determine branching model and deployment targets |
| 3 | [step-03-generate-pipeline.md](steps/step-03-generate-pipeline.md) | Generate CI/CD pipeline configuration |
| 4 | [step-04-release-automation.md](steps/step-04-release-automation.md) | Generate release and changelog automation |
| 5 | [step-05-rollback.md](steps/step-05-rollback.md) | Generate rollback procedure documentation |
| 6 | [step-06-validate.md](steps/step-06-validate.md) | Validate generated configs and present to user |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Pipeline config generated and validated
- Release automation configured
- Rollback procedure documented
- All generated YAML passes syntax validation
- User has reviewed and approved the output
