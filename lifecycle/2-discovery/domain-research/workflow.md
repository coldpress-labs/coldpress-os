---
workflow_version: "1.0"
output_file: "_context/planning/research/domain-{topic}-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides domain research through: topic scoping, web research execution, synthesis, and report generation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-scope.md](steps/step-01-scope.md) | Define research topic and scope |
| 2 | [step-02-research.md](steps/step-02-research.md) | Execute web research with source verification |
| 3 | [step-03-synthesize.md](steps/step-03-synthesize.md) | Synthesize findings into insights |
| 4 | [step-04-report.md](steps/step-04-report.md) | Generate and present research report |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Research topic clearly scoped
- Web sources consulted and cited
- Key findings synthesized into actionable insights
- Report written with proper citations
