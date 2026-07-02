---
workflow_version: "1.0"
output_file: "_context/audit/deployment-readiness-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Runs 8 deployment gates across three phases: scope identification, gate execution, and report generation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-scope.md](steps/step-01-scope.md) | Determine deployment scope (story or epic) |
| 2 | [step-02-gates.md](steps/step-02-gates.md) | Execute all 8 quality gates |
| 3 | [step-03-report.md](steps/step-03-report.md) | Generate readiness report with verdict |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All 8 gates executed
- Every failing gate documented
- Overall readiness verdict issued
