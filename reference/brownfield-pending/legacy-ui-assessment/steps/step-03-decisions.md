---
step_number: 3
step_name: "Decisions + Finalisation"
step_goal: "User decides per asset (keep / refresh / discard / reference-only); editorial; emit validated-distillate + sidecar"
halts_for_input: true
next_step: null
partial_completion_id: "legacy_ui_assessment_step_03"
---

## Goal

User decides per asset based on Step 2 comparisons. Wire `editorial`. Schema-validate. Emit validated-distillate.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "legacy_ui_assessment_step_03", sub_skill: "decisions_finalise", at: "started" }`.

### 2. Per-asset decision prompt

For each asset, present comparison block + recommendation. Prompt:

> **Asset:** `<path>` (<category>)
>
> Comparison summary: <facets summary>
> Phase 4 cross-reference: <module decision>
> Recommendation: **<keep / refresh / discard / reference-only>** — <rationale>
>
> Confirm or override:
> 1. keep — fully compatible; reuse as-is
> 2. refresh — compatible direction; needs token/voice/style update per new brand-guidelines
> 3. discard — divergent direction OR tech-stack incompatible; new authoring
> 4. reference-only — historical reference; informs but isn't reused

Halt for user input. Capture decision + rationale.

### 3. Build decisions table

```
## Decisions

| Asset | Path | Category | Decision | Rationale | Phase 4 alignment |
|-------|------|----------|----------|-----------|-------------------|
| ...   | ...  | ...      | ...      | ...       | aligned/conflict-flagged |
```

### 4. Forward-feed instructions

Append section:

```
## Forward-Feed to Phase 5 Skills

### To `ux-design`
- Components marked `keep` or `refresh` may be reused in screens. Listed below.
- Components marked `discard` should be re-authored fresh.

(list per category)

### To `brand-guidelines`
- Tokens marked `keep` or `refresh` inform new token authoring.
- Token files marked `reference-only` are historical only.

(list)

### Cross-Phase Alignment Conflicts
- <delta-IDs from Step 2 cross-reference conflicts; flagged for ADR>
```

### 5. Editorial-structure wire-in

Invoke `editorial` against the full document. Decisions-table structure check; section ordering.

### 6. Schema-validate

Validate frontmatter against `schemas/design/legacy-ui-assessment.schema.json`. Fix or surface failures.

### 7. Write VC panel

Append VC table; v1.0 entry: "Initial legacy UI assessment Phase 5; <N> assets assessed; decisions: <count-keep>k / <count-refresh>r / <count-discard>d / <count-ref-only>r-o."

### 8. Emit validated-distillate

Move draft to final `_context/design/legacy-ui-assessment-v{N}.md`. Set `status: validated`.

Emit sidecar `legacy-ui-assessment-v{N}.meta.json`:

```json
{
  "schema_version": 1,
  "version": "<N>",
  "validated_at": "<ISO>",
  "sources": { ... },
  "asset_count": <N>,
  "decisions": { "keep": <N>, "refresh": <N>, "discard": <N>, "reference-only": <N> },
  "phase_4_cross_reference_conflicts": <count>,
  "design_deltas_surfaced": <count>
}
```

### 9. Update graph

Add/update node `legacy-ui-assessment-v{N}` with version, status, validated_at, decisions counts.

### 10. Partial-completion clean

`at: "distillate_emitted"`. Clear partial_completion entirely.

## Output

- `_context/design/legacy-ui-assessment-v{N}.md` validated-distillate
- `_context/design/legacy-ui-assessment-v{N}.meta.json` sidecar
- Forward-feed sections for ux-design + brand-guidelines populated
- Cross-phase conflicts logged as design-deltas

## Navigation

→ Phase 5 continues with remaining skills (or proceeds to Phase 5 exit reconciliation if all skills complete).
