---
workflow_version: "1.0"
output_file: "_context/design/narrative-v{N}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Phase 5 narrative — thin wrapper around cross-cutting creative `storytelling`. Frames persona × value-prop × brand-voice context; delegates authoring to creative skill; lands distillate.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-context.md](steps/step-00-context.md) | Graph-first context load + existence_checks |
| 1 | [step-01-frame.md](steps/step-01-frame.md) | Frame inputs; select narrative types from story_types catalog |
| 2 | [step-02-author.md](steps/step-02-author.md) | Delegate to creative `storytelling`; capture output |
| 3 | [step-03-validate.md](steps/step-03-validate.md) | editorial-prose wire-in; emit validated-distillate + sidecar |

## Execution Rules

1. **Skip if vibe-coder-lean.** archetype-mode check at Step 0; skill is optional for lean archetype.
2. **Halt at user-input prompts** (mainly Step 2 during creative storytelling internal flow).
3. **Partial-completion mechanic** active.
4. **Graph-first.** Step 0 loads.
5. **Wrapper, not duplicate.** Step 2 invokes existing creative skill — do not duplicate authoring logic.

## Outputs

- `_context/design/narrative-v{N}.md` (validated-distillate; schema-validated)
- `_context/design/narrative-v{N}.meta.json` (sidecar)
