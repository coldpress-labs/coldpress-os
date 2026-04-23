---
workflow_version: "1.0"
output_file: "_context/planning/creative/problem-solving-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides structured problem-solving through: problem framing, root cause analysis, solution generation, and implementation planning.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-frame.md](steps/step-01-frame.md) | Frame and decompose the problem |
| 2 | [step-02-analyze.md](steps/step-02-analyze.md) | Root cause analysis using selected frameworks |
| 3 | [step-03-solve.md](steps/step-03-solve.md) | Generate and evaluate solution options |
| 4 | [step-04-plan.md](steps/step-04-plan.md) | Create implementation plan for selected solution |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Problem clearly framed with scope and constraints
- Root cause(s) identified with evidence
- Multiple solution options generated and evaluated
- Implementation plan for selected solution
