---
workflow_version: "2.0"
output_file: "_context/sacred/tech-stack.md"
total_steps: 7
resume_from: "frontmatter"
---

## Overview

Guides stack consolidation through 7 steps: ADR inventory → document → pre-lock review → red-flag escape hatch → baselines confirmation → sacred lock + yaml write-back → phase-transition.

Steps 3 and 3a are the "last cheap pivot before the commit binds" moment. After Step 4, pivoting is expensive (wrappers regen, env-provision sinks install time).

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-inventory.md](steps/step-01-inventory.md) | Product-type-aware ADR inventory; gap check against required categories |
| 2 | [step-02-document.md](steps/step-02-document.md) | Draft tech-stack.md + stack-selection-summary with editorial polish |
| 3 | [step-03-pre-lock-review.md](steps/step-03-pre-lock-review.md) | User review of full stack; adversarial-review pass |
| 3a | [step-03a-red-flag-escape-hatch.md](steps/step-03a-red-flag-escape-hatch.md) | Risk aggregation; pause/acknowledge/revise/party-mode menu if critical |
| 5a | [step-05a-baselines-confirmation.md](steps/step-05a-baselines-confirmation.md) | Per-category baselines confirmation before sacred lock |
| 4 | [step-04-lock.md](steps/step-04-lock.md) | Sacred lock with ordered sub-steps; stack_pack + baselines yaml write-back |
| 5 | [step-05-phase-transition.md](steps/step-05-phase-transition.md) | Invoke phase-transition cross-cutting skill (Phase 3 → Phase 4) |

*Note: Step numbering reflects the spec (3a and 5a are insertions; step ordering follows the plan, not the numeric sequence).*

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Step 4 sub-step ordering is load-bearing** — validate-schema fires before `sacred: true` is written. Never reorder.
3. **Complete each step fully** before proceeding.
4. **Halt at menus.** When a step presents options, wait for user input.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, Step 0 entry-check reads partial_completion state.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All product-type-required categories covered by ADRs
- tech-stack.md drafted, reviewed, adversarially-critiqued, schema-valid
- Red-flag escape hatch passed (no critical blocks, or user acknowledged and continued)
- All 4 baselines categories confirmed / opted-out
- tech-stack.md locked as sacred (sacred: true + approver + lock notice)
- stack_pack written to coldpress.yaml (name or empty string)
- baselines: block written to coldpress.yaml and schema-valid
- phase-transition invoked; handoff log written
