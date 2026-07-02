---
workflow_version: "1.0"
output_directory: "_context/design/prototype/{date}/"
total_steps: 5
resume_from: "manifest"
---

## Overview

Phase 5 prototype — archetype-shaped tangible artefacts. Reads validated ux-design-spec + brand-guidelines + tech-stack; produces directory with manifest + mode-conditional files.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-context.md](steps/step-00-context.md) | Graph-first context load + existence_checks |
| 1 | [step-01-mode-select.md](steps/step-01-mode-select.md) | Mode select per archetype; user-override path |
| 2 | [step-02-skeleton.md](steps/step-02-skeleton.md) | Author scaffolds with PRD acceptance-criteria comments + brand tokens applied (mode-conditional logic inside the step) |
| 3 | [step-03-iteration.md](steps/step-03-iteration.md) | design-thinking prototype + test stages; iterate per user feedback |
| 4 | [step-04-validate.md](steps/step-04-validate.md) | adversarial-review; tech-stack imports verification; aggregate design-deltas; emit manifest |

## Execution Rules

1. **Mode-conditional content** — Step 2 branches per `mode` selected in Step 1.
2. **Tech-stack imports** parsed and verified at Step 4 (code-skeleton mode only).
3. **Halt at user-input prompts.** Mode override, content choices, iteration feedback all require input.
4. **Partial-completion mechanic** active in every step.
5. **Manifest is the contract.** Schema-validated; consumed by Phase 6 architecture-design + Phase 8 dev-story reference.

## Outputs

- `_context/design/prototype/{date}/manifest.json` (schema-validated)
- `_context/design/prototype/{date}/<mode-conditional-files>`
