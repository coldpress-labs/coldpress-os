---
workflow_version: "1.0"
output_file: "_context/sacred/context.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Conducts a structured interview across four phases: project vision, user understanding, constraints and rules, and synthesis into the context document.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-vision.md](steps/step-01-vision.md) | Understand project vision, goals, and scope |
| 2 | [step-02-users.md](steps/step-02-users.md) | Identify users, use cases, and value proposition |
| 3 | [step-03-constraints.md](steps/step-03-constraints.md) | Gather constraints, rules, patterns, and guidelines |
| 4 | [step-04-synthesize.md](steps/step-04-synthesize.md) | Synthesize findings into context.md |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Project vision and goals documented
- Users and value proposition defined
- Constraints and implementation rules captured
- context.md written as lean, LLM-optimized document
