---
workflow_version: "2.0"
output_file: "_context/planning/design-brief-v{N}.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Creates the Phase 5 design brief — content strategy, brand voice, visual direction, platform/a11y requirements — bridging the locked PRD into design-shape work. Bridge mode only (Shape A); product-brief-v{N} + PRD always present at Phase 5 entry.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-context.md](steps/step-00-context.md) | Graph-first context load + staleness check + bridge confirm + brownfield-UI flag + design-deltas WIP log init (NEW — absorbs entry-sync) |
| 1 | [step-01-mode.md](steps/step-01-mode.md) | Confirm bridge mode (Shape A; standalone removed) |
| 2 | [step-02-content.md](steps/step-02-content.md) | Content strategy + brand voice — brainstorming + advanced-elicitation Tier-1 |
| 3 | [step-03-visual.md](steps/step-03-visual.md) | Visual direction + token foundation reference — design-thinking ideate + brainstorming |
| 4 | [step-04-platform.md](steps/step-04-platform.md) | Platform/responsive + a11y baseline-driven; supersede-check; editorial wire-ins; emit distillate + sidecar; aggregate design-deltas |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at user-input prompts.** Never generate content without user confirmation.
4. **No skipping.** Every step exists for a reason.
5. **Partial-completion mechanic.** Each step writes `partial_completion: { step_id, sub_skill, at, resume_token }` to `coldpress.yaml` at start; clears on clean exit. Resume picks up at the marked sub-step.
6. **Graph-first.** Step 0 loads from graph; subsequent steps consult the graph for derived facts (don't re-glob the filesystem).
7. **Design-deltas.** Steps 2–4 may surface PRD-amendment implications — write to `_context/handoffs/phase-5-design-deltas-wip-{date}.md`. Aggregated at Phase 5 exit by `phase-transition`.

## Outputs

- `_context/planning/design-brief-v{N}.md` (validated-distillate; schema-validated)
- `_context/planning/design-brief-v{N}.meta.json` (sidecar)
- `_context/handoffs/phase-5-design-deltas-wip-{date}.md` (initialised at Step 0; appended at Steps 2–4)
