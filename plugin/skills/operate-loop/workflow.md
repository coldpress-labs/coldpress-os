---
workflow_version: "1.1"
output_file: "inline"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Summarizes sprint status through: data parsing and risk detection, comparison against the PERT chart and sprint goals, then presentation with recommended next action.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-analyze.md](steps/step-01-analyze.md) | Parse sprint-status.yaml, count by status, detect risks |
| 2 | [step-02-compare.md](steps/step-02-compare.md) | Compare actual progress against PERT chart and sprint goals |
| 3 | [step-03-recommend.md](steps/step-03-recommend.md) | Present dashboard and recommend next action |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **No skipping.** Every step exists for a reason.
4. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Sprint status parsed and analyzed
- Progress compared against PERT chart and sprint plan
- Velocity calculated, deviations flagged
- Risks surfaced
- Next action recommended
