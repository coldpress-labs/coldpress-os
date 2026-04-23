---
workflow_version: "1.0"
output_file: "_context/testing/test-plan-{scope}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Designs a test plan by analyzing requirements, defining test strategy, mapping coverage, and producing a structured test plan document.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-scope.md](steps/step-01-scope.md) | Define test scope and analyze requirements |
| 2 | [step-02-strategy.md](steps/step-02-strategy.md) | Define test strategy and approach |
| 3 | [step-03-coverage.md](steps/step-03-coverage.md) | Map test coverage to requirements |
| 4 | [step-04-plan.md](steps/step-04-plan.md) | Compile and present the test plan |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Scope clearly defined (system or epic level)
- Test strategy documented with test types and approach
- Coverage matrix maps every requirement to test cases
- Complete test plan document produced
