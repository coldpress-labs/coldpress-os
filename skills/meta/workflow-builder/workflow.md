---
workflow_version: "1.0"
output_file: "target skill directory"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Guides workflow creation through: mode selection (build/convert/analyze), workflow design and step generation, and validation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-mode.md](steps/step-01-mode.md) | Select mode and gather workflow details |
| 2 | [step-02-build.md](steps/step-02-build.md) | Build workflow.md and step files |
| 3 | [step-03-validate.md](steps/step-03-validate.md) | Validate step chain integrity |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- workflow.md complete with step index
- All step files generated with correct frontmatter
- Step chain validates (step N → step N+1 → ... → complete)
- All files written to target directory
