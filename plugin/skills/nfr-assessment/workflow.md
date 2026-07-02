---
workflow_version: "1.0"
output_file: "_context/testing/nfr-assessment-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Extracts NFRs from project documents, assesses implementation against each, and produces a gap analysis with risk ratings.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-extract.md](steps/step-01-extract.md) | Extract NFRs from PRD and architecture docs |
| 2 | [step-02-assess.md](steps/step-02-assess.md) | Assess implementation against each NFR |
| 3 | [step-03-report.md](steps/step-03-report.md) | Generate gap analysis and recommendations |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All NFRs extracted and categorized
- Each NFR assessed against implementation
- Gap analysis produced with risk ratings
- Remediation recommendations prioritized
