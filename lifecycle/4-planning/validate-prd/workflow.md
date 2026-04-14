---
workflow_version: "1.0"
output_file: "_output/planning/prd-validation-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Validates an existing PRD against six quality dimensions: completeness, consistency, testability, alignment, feasibility, and implementability. Produces a validation report with pass/fail per dimension, specific issues, and actionable recommendations.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-load.md](steps/step-01-load.md) | Load PRD and supporting sacred documents |
| 2 | [step-02-validate.md](steps/step-02-validate.md) | Run six validation checks, score each dimension |
| 3 | [step-03-report.md](steps/step-03-report.md) | Generate validation report with findings and recommendations |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All six validation dimensions assessed with pass/fail/warning
- Specific issues documented with section references
- Actionable recommendations provided for each issue
- Overall readiness verdict: READY / NEEDS REVISION / BLOCKED
- User has reviewed findings
