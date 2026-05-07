---
workflow_version: "2.0"
output_file: "_context/planning/research/constraint-{topic}-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Guides constraint research through: topic scoping, evidence gathering, constraint synthesis, and binding-envelope reporting. Produces the set of MUST-satisfy conditions that bound Phase 3's stack selection and Phase 4's architecture.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-scope.md](steps/step-01-scope.md) | Define constraint topic and classification axes |
| 2 | [step-02-research.md](steps/step-02-research.md) | Gather constraint evidence from authorities, vendors, and pre-loaded `_input/` |
| 3 | [step-03-compare.md](steps/step-03-compare.md) | Synthesise constraints — classify, de-duplicate, tag severity |
| 4 | [step-04-report.md](steps/step-04-report.md) | Produce the binding constraint envelope |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **No skipping.** Every step exists for a reason.
4. **State is tracked** in the output document's YAML frontmatter.
5. **Resumable.** On interruption, resume from the last completed step.
6. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Constraints identified across all relevant axes (compliance / protocol / performance / accessibility / regulatory / locale / device)
- Each constraint cited to an authoritative source
- Severity tagged per constraint (blocking / preferred / aspirational)
- Conflicts flagged for Phase 3 resolution
- Binding envelope document produced — ready for Phase 3 stack evaluation to honour
