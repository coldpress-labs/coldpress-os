---
workflow_version: "2.0"
output_file: "_context/design/ux-design-spec-v{N}.md"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Phase 5 UX design specification. Persona-grounded user flows, key screen concepts, interaction patterns, responsive + a11y. Reads PRD + design-brief + personas + baselines from graph; produces validated-distillate.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-context.md](steps/step-00-context.md) | Graph-first context load + existence_checks (NEW) |
| 1 | [step-01-context.md](steps/step-01-context.md) | Scope confirm + planning-scope memo + persona direct-read |
| 2 | [step-02-flows.md](steps/step-02-flows.md) | Persona-grounded user flows + supersede-check (stack feasibility) |
| 3 | [step-03-wireframes.md](steps/step-03-wireframes.md) | Wireframes/screens — design-thinking ideate + scenario-planning + problem-solving + advanced-elicitation |
| 4 | [step-04-spec.md](steps/step-04-spec.md) | Emit validated-distillate + sidecar; aggregate design-deltas; supersede-check on PRD-feature-coverage; adversarial-review + editorial-structure wire-ins |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Persona direct-read.** Step 2 reads `personas-v{latest}.md` not PRD-derived persona section.
3. **Halt at user-input prompts.** Wireframe alternatives, edge-case enumerations, etc.
4. **Partial-completion mechanic** active in every step.
5. **Graph-first.** Step 0 loads; subsequent steps consult graph for derived facts.
6. **Design-deltas.** Steps 2–4 may surface; appended to `phase-5-design-deltas-wip-{date}.md`.
7. **NO `phase-transition` invocation here.** Last-skill-in-flow invokes phase-transition; ux-design isn't always last (`prototype`, or ad-hoc `skills/creative/storytelling` narrative work, may follow). Phase 5 gate.json post-exit-action handles phase-transition centrally.

## Outputs

- `_context/design/ux-design-spec-v{N}.md` (validated-distillate; schema-validated)
- `_context/design/ux-design-spec-v{N}.meta.json` (sidecar)
- Design-deltas appended to phase-5-design-deltas-wip-{date}.md
