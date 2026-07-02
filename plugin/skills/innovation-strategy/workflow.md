---
workflow_version: "1.0"
output_file: "_context/planning/creative/innovation-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides innovation strategy development through: market landscape analysis, opportunity identification, business model design, and strategic roadmap creation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-landscape.md](steps/step-01-landscape.md) | Analyze market landscape and competitive positioning |
| 2 | [step-02-opportunities.md](steps/step-02-opportunities.md) | Identify disruption and innovation opportunities |
| 3 | [step-03-model.md](steps/step-03-model.md) | Design business model concepts |
| 4 | [step-04-roadmap.md](steps/step-04-roadmap.md) | Create strategic roadmap and recommendations |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Market landscape analyzed with competitive positioning
- Innovation opportunities identified and prioritized
- Business model concepts designed
- Strategic roadmap with actionable next steps
