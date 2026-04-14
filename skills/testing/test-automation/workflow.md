---
workflow_version: "1.0"
output_file: "_output/testing/automation-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Analyzes untested code, generates tests for it, runs them, and reports on coverage improvement.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-analyze.md](steps/step-01-analyze.md) | Analyze scope and identify untested code |
| 2 | [step-02-generate.md](steps/step-02-generate.md) | Generate tests for identified gaps |
| 3 | [step-03-run.md](steps/step-03-run.md) | Run generated tests and fix failures |
| 4 | [step-04-report.md](steps/step-04-report.md) | Generate coverage summary report |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Untested code identified
- Tests generated for critical paths
- All generated tests pass
- Coverage improvement documented
