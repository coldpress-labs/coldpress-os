---
workflow_version: "1.0"
output_file: "_context/design/legacy-ui-assessment-v{N}.md"
total_steps: 4
resume_from: "frontmatter"
conditional: true
---

## Overview

Conditional Phase 5 skill — assesses `_input/legacy/` UI/design assets against new design-brief direction. Silent skip if no UI legacy.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-context.md](steps/step-00-context.md) | Graph-first context load + trigger_condition check (silent skip if false) |
| 1 | [step-01-inventory.md](steps/step-01-inventory.md) | Inventory + categorise legacy UI assets |
| 2 | [step-02-compare.md](steps/step-02-compare.md) | Compare each asset against design-brief direction; cross-reference legacy-migration-plan |
| 3 | [step-03-decisions.md](steps/step-03-decisions.md) | Emit decisions per asset (keep / refresh / discard / reference-only); editorial-structure; emit validated-distillate |

## Execution Rules

1. **Conditional execution.** Step 0 may silently skip the skill.
2. **Halt at user-input prompts** (decisions per asset).
3. **Partial-completion mechanic** active.
4. **Cross-reference with Phase 4.** Step 2 reads legacy-migration-plan to align architecture and UI decisions.

## Outputs

- `_context/design/legacy-ui-assessment-v{N}.md` (validated-distillate; schema-validated)
- `_context/design/legacy-ui-assessment-v{N}.meta.json` (sidecar)
