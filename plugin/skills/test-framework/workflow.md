---
workflow_version: "1.0"
output_file: "_context/testing/framework-setup-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Sets up a test framework by detecting the stack, selecting the right tool, installing and configuring it, writing example tests, and verifying everything runs.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-detect.md](steps/step-01-detect.md) | Detect stack and recommend test framework |
| 2 | [step-02-install.md](steps/step-02-install.md) | Install and configure the framework |
| 3 | [step-03-examples.md](steps/step-03-examples.md) | Create example tests and directory structure |
| 4 | [step-04-verify.md](steps/step-04-verify.md) | Run tests and verify setup |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Test framework installed and configured
- Example tests created and passing
- NPM scripts added for running tests
- Setup report generated
