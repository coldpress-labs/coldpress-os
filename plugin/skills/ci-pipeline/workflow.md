---
workflow_version: "1.0"
output_file: ".github/workflows/quality.yml"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Scaffolds a CI quality pipeline by detecting existing test setup, generating pipeline configuration with quality gates, and validating the output.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-audit.md](steps/step-01-audit.md) | Audit existing test setup and CI configuration |
| 2 | [step-02-generate.md](steps/step-02-generate.md) | Generate quality pipeline configuration |
| 3 | [step-03-validate.md](steps/step-03-validate.md) | Validate and present the pipeline |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Test execution stages defined for all test types
- Coverage thresholds configured
- Quality gates enforce minimum standards
- Pipeline validated and ready to use
