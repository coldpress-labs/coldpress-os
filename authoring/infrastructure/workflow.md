# Workflow Template — coldpress-os

> For workflow-type skills. Place as `workflow.md` inside the skill directory.

---

```yaml
---
workflow_version: "1.0"
output_file: "{output_folder}/{artifact-name}.md"
total_steps: {N}
resume_from: "frontmatter"
---
```

## Overview

{What this workflow accomplishes end-to-end.}

## Step Index

| Step | Name | Goal | Halts? |
|------|------|------|--------|
| 1 | {Name} | {Goal} | Yes/No |
| 2 | {Name} | {Goal} | Yes/No |
| ... | ... | ... | ... |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation.

## Completion Criteria

{How to know the workflow is done. What the final output looks like.}
