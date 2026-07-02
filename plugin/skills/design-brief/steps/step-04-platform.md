---
step_number: 4
step_name: "Platform + A11y + Finalisation"
step_goal: "Author platform/responsive + a11y baseline-driven section; supersede-check; editorial wire-ins; emit validated-distillate + sidecar; aggregate design-deltas"
halts_for_input: true
next_step: null
partial_completion_id: "design_brief_step_04"
---

## Goal

Final step. Author platform/responsive strategy + accessibility requirements grounded in active a11y baseline. Run final supersede-check across the full draft. Wire `editorial` and `editorial`. Emit validated-distillate + sidecar. Aggregate design-deltas (the WIP log entries from Steps 2–3 stay in WIP; Phase-5 exit aggregator will move them to phase-5-to-6 handoff).

## Instructions

### 1. Partial-completion write

Write `partial_completion: { step_id: "design_brief_step_04", sub_skill: "platform_a11y_finalise", at: "started" }`.

### 2. Platform / responsive strategy prompt

> **Platform.** Based on personas device targets and PRD:
>
> - **Primary platform(s):** web / iOS / Android / desktop / multi
> - **Responsive breakpoints:** sm/md/lg/xl values + content reflow strategy
> - **Touch vs. pointer:** one-or-both; gesture-rich or pointer-precise?
> - **Offline considerations:** required / nice-to-have / N/A?

Halt for user input.

### 3. A11y baseline-driven authoring

From Step 0: `coldpress.yaml baselines.a11y_axis` declared (one of: WCAG-AA, WCAG-AAA, none).

If WCAG-AA (default):

- Contrast minimums: 4.5:1 normal text, 3:1 large
- Keyboard: full keyboard navigation; visible focus
- Screen reader: meaningful alt text, ARIA roles where standard semantics insufficient

If WCAG-AAA opt-in:

- Contrast minimums: 7:1 normal, 4.5:1 large
- Plus: motion-reduce respect, language-of-parts annotations, contextual help

If no a11y baseline:

- Surface as design-delta with `delta_type: conflicting`, `recommendation: accept_into_prd` (PRD should declare an a11y NFR; missing = scope gap).

### 4. Vague-platform-constraints elicitation trigger

If user answers "responsive everywhere" or "full a11y" without specificity, invoke `advanced-elicitation` (method `scenario-walkthrough`) — drill down via "walk through how a screen-reader user accomplishes [primary task]".

### 5. Final supersede-check sweep

Across the full draft document, run the supersede pairs noted in Step 0:

- design-brief content vs product-brief value prop
- brand voice vs persona accessibility/device/language targets
- visual direction vs tech-stack.css_strategy
- platform/a11y vs coldpress.yaml baselines

For each conflict: surface as `design_delta` in WIP log per the schema. Recommendation usually `accept_into_prd` (most design-driven discoveries are PRD refinements) or `flag_for_architecture_ADR` (when Phase 6 architectural decision can absorb the delta).

### 6. Editorial wire-ins

Invoke `editorial` skill against the draft — voice/tone consistency check across all 4 substantive sections (content strategy, voice, visual, platform/a11y). User reviews suggestions; accept/reject.

Invoke `editorial` skill — section ordering, header consistency, scannable structure. User reviews suggestions; accept/reject.

### 7. Write Version Control panel

Append VC table to draft document. v1.0 entry: "Initial design-brief authored Phase 5; bridge mode; sources versioned per frontmatter."

### 8. Schema-validate

Run schema validation against `schemas/design/design-brief.schema.json`. If fail: surface validation errors; user fixes; re-run.

### 9. Emit validated-distillate

Move draft to final path `_context/planning/design-brief-v{N}.md` (where N = next version number; v1 if first run, v(prev+1) if re-run).

Set frontmatter `status: validated`.

### 10. Emit sidecar

Write `_context/planning/design-brief-v{N}.meta.json`:

```json
{
  "schema_version": 1,
  "version": "<N>",
  "validated_at": "<ISO timestamp>",
  "sources": { "prd": "<version>", "product_brief": "<version>", "personas": "<version>" },
  "design_deltas_surfaced": <count>,
  "supersede_check_passes": <count>,
  "advanced_elicitation_invocations": <count>
}
```

### 11. Update graph

Add/update node `design-brief-v{N}` with properties (version, status, validated_at, source_versions, etc.). The `coldpress update --post-skill` hook is invoked here (or after exit) to re-prime the graph.

### 12. Partial-completion clean

Update `partial_completion: { step_id: "design_brief_step_04", sub_skill: "platform_a11y_finalise", at: "distillate_emitted" }`.

Then clear the partial_completion mechanic for design-brief entirely (skill complete).

## Output

- `_context/planning/design-brief-v{N}.md` validated-distillate
- `_context/planning/design-brief-v{N}.meta.json` sidecar
- Design-deltas WIP log appended (aggregation at Phase 5 exit)
- Graph node updated

## Navigation

→ Phase 5 continues with `ux-design` || `brand-guidelines` (parallel-OK). (`legacy-ui-assessment` — previously conditional here on `legacy_ui_assets_detected: true` — moved to `reference/brownfield-pending/`, WS5-B §8 item 6, ledger delta D17.)
