---
workflow_version: "1.0"
output_file: "_context/planning/readiness-report-{date}.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Validates implementation readiness through: document discovery, PRD analysis, coverage validation, alignment checking, and final assessment.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-discovery.md](steps/step-01-discovery.md) | Find and inventory all project documents |
| 2 | [step-02-prd-analysis.md](steps/step-02-prd-analysis.md) | Extract all requirements from PRD |
| 3 | [step-03-coverage.md](steps/step-03-coverage.md) | Validate FR coverage in epics/stories |
| 4 | [step-04-alignment.md](steps/step-04-alignment.md) | Check UX ↔ PRD ↔ Architecture alignment |
| 5 | [step-05-assessment.md](steps/step-05-assessment.md) | Final readiness verdict |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All documents inventoried
- Every FR/NFR extracted and traced to epics
- Cross-document alignment verified
- Readiness verdict issued: READY / NEEDS WORK / NOT READY
