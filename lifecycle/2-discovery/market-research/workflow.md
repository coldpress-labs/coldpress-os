---
workflow_version: "1.0"
output_file: "_context/planning/research/market-{topic}-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides market research through: topic scoping, competitive and customer research, synthesis, and report generation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-scope.md](steps/step-01-scope.md) | Define research focus and competitive set |
| 2 | [step-02-research.md](steps/step-02-research.md) | Execute competitive and market research |
| 3 | [step-03-synthesize.md](steps/step-03-synthesize.md) | Synthesize findings into strategic insights |
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

- Competitive landscape mapped
- Customer segments identified
- Market opportunity assessed
- Report with citations produced
