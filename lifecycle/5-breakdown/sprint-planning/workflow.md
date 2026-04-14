---
workflow_version: "1.0"
output_file: "_output/tracking/sprint-status.yaml"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Generates sprint tracking by parsing epics, detecting statuses from existing files, and producing a YAML status file.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-parse.md](steps/step-01-parse.md) | Parse epics and extract all work items |
| 2 | [step-02-detect.md](steps/step-02-detect.md) | Detect current statuses from existing files |
| 3 | [step-03-generate.md](steps/step-03-generate.md) | Generate sprint-status.yaml |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All epics and stories extracted from epics.md
- Statuses detected from existing files (never downgraded)
- sprint-status.yaml generated with valid structure
