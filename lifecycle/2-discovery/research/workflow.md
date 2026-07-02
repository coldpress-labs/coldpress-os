---
workflow_version: "1.0"
output_file: "_context/planning/research/{focus}-{topic}-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides research through: topic scoping, evidence gathering, synthesis, and report generation. Every step branches on the `focus` parameter (`domain` | `market` | `constraints`) selected at invocation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-scope.md](steps/step-01-scope.md) | Define research topic/scope; check `_input/` for pre-loaded material before web search |
| 2 | [step-02-research.md](steps/step-02-research.md) | Execute research with source verification |
| 3 | [step-03-synthesize.md](steps/step-03-synthesize.md) | Synthesize findings (domain/market) or classify + tag severity (constraints) |
| 4 | [step-04-report.md](steps/step-04-report.md) | Generate and present the final report or binding envelope |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter, including `focus:` and `depth:`.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Research topic clearly scoped, with `focus` and `depth` recorded
- Sources consulted and cited (web + any pre-loaded `_input/` material)
- Findings synthesized (domain/market) or classified + severity-tagged (constraints)
- Report or binding envelope written with proper citations

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-02 | Butler | Initial merged workflow — absorbs `domain-research`, `market-research`, `constraint-research` (WS5-B, §8 item 6). |
