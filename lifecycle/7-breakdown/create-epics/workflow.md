---
workflow_version: "2.0"
output_file: "_context/planning/epics-v{N}.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Phase 7 epic authoring. Reads breakdown-scope + PRD + architecture + UX-spec; produces validated-distillate epics.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-context.md](steps/step-00-context.md) | Graph-first context load + existence_checks |
| 1 | [step-01-prerequisites.md](steps/step-01-prerequisites.md) | Verify Phase 7 entry-sync done; load breakdown-scope memo |
| 2 | [step-02-decompose.md](steps/step-02-decompose.md) | Group PRD user-stories by user-value into epics; brainstorming + design-thinking Tier-1 |
| 3 | [step-03-stories.md](steps/step-03-stories.md) | Per-epic acceptance criteria + epic-to-component mapping |
| 4 | [step-04-validate.md](steps/step-04-validate.md) | Supersede-check on PRD coverage; editorial; emit distillate + sidecar |

## Execution Rules

1. Halt at user prompts (epic groupings).
2. Partial-completion mechanic active.
3. Graph-first; subsequent steps consult graph.
4. Supersede-check on PRD-feature coverage at Step 4.

## Outputs

- `_context/planning/epics-v{N}.md` (validated-distillate)
- `_context/planning/epics-v{N}.meta.json` (sidecar)
