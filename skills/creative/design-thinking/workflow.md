---
workflow_version: "1.0"
output_file: "_output/creative/design-thinking-{date}.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Walks through the five stages of design thinking: Empathize (understand users), Define (frame the problem), Ideate (generate solutions), Prototype (make it tangible), Test (validate with users).

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-empathize.md](steps/step-01-empathize.md) | Understand user needs, pain points, and context |
| 2 | [step-02-define.md](steps/step-02-define.md) | Synthesize insights into a clear problem statement |
| 3 | [step-03-ideate.md](steps/step-03-ideate.md) | Generate solution concepts |
| 4 | [step-04-prototype.md](steps/step-04-prototype.md) | Define prototype approach and key screens/flows |
| 5 | [step-05-test.md](steps/step-05-test.md) | Plan user testing and validation |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- User empathy documented with personas or journey maps
- Problem statement clearly defined (How Might We...)
- Solution concepts generated and prioritized
- Prototype plan or wireframe concepts created
- User testing plan defined
