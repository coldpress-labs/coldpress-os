---
workflow_version: "1.0"
output_file: "_context/planning/research/technical-{topic}-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides technical research through: topic scoping, technology evaluation, comparison analysis, and report generation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-scope.md](steps/step-01-scope.md) | Define research topic and evaluation criteria |
| 2 | [step-02-research.md](steps/step-02-research.md) | Research technologies with benchmarks and docs |
| 3 | [step-03-compare.md](steps/step-03-compare.md) | Compare options against criteria |
| 4 | [step-04-report.md](steps/step-04-report.md) | Generate recommendation report |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **No skipping.** Every step exists for a reason.
4. **State is tracked** in the output document's YAML frontmatter.
5. **Resumable.** On interruption, resume from the last completed step.
6. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Technologies researched with current documentation
- Comparison matrix produced
- Recommendation made with rationale
