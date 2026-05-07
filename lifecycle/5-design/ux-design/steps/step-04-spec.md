---
step_number: 4
step_name: "Spec Finalisation + Distillate Emit"
step_goal: "Author remaining sections (responsive, a11y, tokens reference, design overview); supersede-check on PRD-feature-coverage; adversarial-review + editorial-structure wire-ins; emit validated-distillate + sidecar"
halts_for_input: true
next_step: null
partial_completion_id: "ux_design_step_04"
---

## Goal

Final step. Author Section 1.1 (Design Principles), Section 6 (Responsive Strategy), Section 7 (Accessibility), Section 8 (Tokens Reference — points to brand-guidelines). Run final supersede-check. Wire `adversarial-review` + `editorial-structure`. Emit validated-distillate + sidecar.

NOTE: `phase-transition` is NOT invoked here. Phase 5 gate.json post-exit-action invokes phase-transition centrally (after the last skill in the archetype-flow completes).

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "ux_design_step_04", sub_skill: "finalise", at: "started" }`.

### 2. Section 6 — Responsive Strategy

Read `design-brief-v{latest}` Section "Platform". Author:
- Breakpoints (sm/md/lg/xl values)
- Per-breakpoint: which screens reflow, which collapse, which hide
- Touch vs pointer adjustments
- Image / asset breakpoints

### 3. Section 7 — Accessibility (a11y baseline-driven)

Read `coldpress.yaml baselines.a11y_axis`:

If WCAG-AA:
- Contrast: 4.5:1 normal, 3:1 large (token-level enforced by brand-guidelines)
- Keyboard: full nav, visible focus, escape closes overlays
- Screen reader: landmark roles, heading hierarchy, aria-label where needed
- Forms: label association, error association

If WCAG-AAA opt-in:
- All AA + Contrast 7:1, motion-reduce honoured, language-of-parts annotated, contextual help available
- Surface upgraded thresholds; brand-guidelines must enforce

If no baseline declared (warn):
- Default to WCAG-AA but surface as design-delta (PRD should declare a11y NFR)

### 4. Section 8 — Tokens Reference

```
## 8. Design Tokens

> See `_context/design/brand-guidelines-v{latest}.md` § Tokens for canonical token values.

**Reference:** `brand-guidelines-v{latest}` produced by Phase 5 `brand-guidelines` skill (validated-distillate; schema'd at `schemas/design/brand-guidelines.schema.json`).

If brand-guidelines not yet emitted at the time of this UX spec's authoring, list a "TBD" placeholder per token category (colour-family / type-pair-concept / spacing-concept / motion-concept) referencing design-brief Section 3 (Visual Direction) for direction.
```

### 5. Section 1.1 — Design Principles

Distil from design-brief content strategy + brand voice + visual direction. Authored last because it's a synthesis of upstream sections.

### 6. Final supersede-check sweep

Run pairs noted in Step 0 across the full draft:
- UX flows vs tech-stack capabilities (already in Step 2)
- Interaction patterns vs tech-stack.css_strategy
- A11y specifics vs baselines.a11y_axis
- Screen content vs PRD user_story_ids — every PRD user story should be reachable through a flow + screen

Final check: PRD-feature-coverage. List every PRD user-story-ID; for each, name the flow + screen that implements it. Uncovered = design-delta (additive) or design-delta (modifying — story too vague to design).

### 7. Adversarial-review wire-in

Invoke `adversarial-review` skill against the draft. Method: red-team / pre-mortem. Common challenges:
- "What if every persona uses primary nav instead of search?"
- "What if mobile users dominate? Does flow X scale?"
- "What if a11y baseline is wrong / under-specified for this domain?"

User reviews adversarial findings; accept (revise) or reject with rationale.

### 8. Editorial-structure wire-in

Invoke `editorial-structure` against the draft. Section ordering, header consistency, scannable structure.

### 9. Schema-validate

Run schema validation against `schemas/design/ux-design-spec.schema.json`. Fix or surface failures.

### 10. Emit validated-distillate

Move draft to final `_context/design/ux-design-spec-v{N}.md`. Set `status: validated`.

Emit sidecar `_context/design/ux-design-spec-v{N}.meta.json`:

```json
{
  "schema_version": 1,
  "version": "<N>",
  "validated_at": "<ISO>",
  "sources": { "prd": "<v>", "design_brief": "<v>", "personas": "<v>", ... },
  "screens_count": <N>,
  "flows_count": <N>,
  "design_deltas_surfaced": <count>,
  "supersede_check_passes": <count>,
  "advanced_elicitation_invocations": <count>,
  "adversarial_review_findings": <count>,
  "prd_user_story_coverage": "<N>/<total>"
}
```

### 11. Update graph

Update node `ux-design-spec-v{N}` with version, status, validated_at, source_versions, screens, flows.

### 12. Partial-completion clean

`at: "distillate_emitted"`. Clear partial_completion entirely (skill complete).

## Output

- `_context/design/ux-design-spec-v{N}.md` validated-distillate
- `_context/design/ux-design-spec-v{N}.meta.json` sidecar
- design-deltas appended to WIP log
- Graph node updated

## Navigation

→ Phase 5 continues with `prototype` (after brand-guidelines also emits) and/or `narrative` (parallel-OK after brand-guidelines).
