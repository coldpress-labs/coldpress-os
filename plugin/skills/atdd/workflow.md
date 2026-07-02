---
workflow_version: "1.0"
output_file: "tests/acceptance/"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Translates acceptance criteria into failing tests through: criteria extraction, test case design, test generation, and verification that tests fail correctly (proving they test real behavior).

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-extract.md](steps/step-01-extract.md) | Extract and validate acceptance criteria |
| 2 | [step-02-design.md](steps/step-02-design.md) | Design test cases from criteria |
| 3 | [step-03-generate.md](steps/step-03-generate.md) | Generate executable test files |
| 4 | [step-04-verify-fail.md](steps/step-04-verify-fail.md) | Run tests and verify they fail correctly |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All acceptance criteria translated to test cases
- Test files generated and syntactically valid
- Tests run and fail correctly (not due to syntax errors)
- Developer has clear implementation targets
