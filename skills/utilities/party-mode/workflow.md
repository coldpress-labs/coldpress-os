---
workflow_version: "1.0"
output_file: "_output/discussions/party-{date}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Activates all available agent personas, facilitates a multi-agent discussion on a given topic, and produces a transcript with key insights.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-agent-loading.md](steps/step-01-agent-loading.md) | Load agent roster and activate personas |
| 2 | [step-02-discussion.md](steps/step-02-discussion.md) | Facilitate multi-agent discussion rounds |
| 3 | [step-03-wrap-up.md](steps/step-03-wrap-up.md) | Summarize insights and close session |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All relevant agents activated and contributed
- User's topic thoroughly explored from multiple perspectives
- Transcript written with key takeaways
