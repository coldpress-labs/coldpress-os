---
workflow_version: "1.0"
output_file: "_output/planning/design-brief-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Creates a comprehensive design brief covering product positioning, content strategy, visual direction, and platform requirements. Supports two operating modes: standalone (full discovery) and bridge (imports product-brief, skips redundant discovery).

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-mode.md](steps/step-01-mode.md) | Detect standalone vs bridge mode, load product-brief if bridge |
| 2 | [step-02-content.md](steps/step-02-content.md) | Content strategy, brand voice, messaging |
| 3 | [step-03-visual.md](steps/step-03-visual.md) | Visual direction, design tokens, inspiration |
| 4 | [step-04-platform.md](steps/step-04-platform.md) | Platform requirements, responsive strategy, finalize |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Operating mode detected and context loaded
- Content strategy and brand voice defined
- Visual direction with design tokens established
- Platform requirements and responsive strategy documented
- User has approved the final design brief
