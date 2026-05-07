---
step_number: 2
step_name: "Compare Against design-brief + Cross-Reference Phase 4"
step_goal: "For each asset, compare against new design-brief direction; cross-reference Phase 4 legacy-migration-plan architecture decisions"
halts_for_input: false
next_step: "step-03-decisions.md"
partial_completion_id: "legacy_ui_assessment_step_02"
---

## Goal

Compare each legacy asset against the design-brief direction. Cross-reference with Phase 4 `legacy-migration-plan` if it exists (architecture decisions inform UI decisions — e.g., a legacy module marked `discard` for tech-stack-incompatibility should also be `discard` here).

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "legacy_ui_assessment_step_02", sub_skill: "compare", at: "started" }`.

### 2. Per-asset comparison

For each asset in inventory, compute comparison facets:

| Facet | Source | Comparison |
|-------|--------|------------|
| visual direction | design-brief Section "Visual Direction" | Does asset match new mood/feel? |
| brand voice | design-brief Section "Brand Voice" | Does asset (style-guide / marketing) carry compatible voice? |
| tokens | brand-guidelines (if exists) OR design-brief foundational-token-feel | Are legacy tokens compatible / mappable? |
| tech-stack | tech-stack-md.css_strategy | Is asset implementable in new stack? |
| a11y baseline | coldpress.yaml baselines | Does asset meet new a11y level? |

### 3. Cross-reference Phase 4 legacy-migration-plan

If `legacy-migration-plan-v{latest}` exists, read decisions per legacy module. For each UI asset belonging to a module that Phase 4 decided to:
- `keep`: UI assessment defaults to "keep" or "refresh" (architecture compatible; assess UI-direction fit)
- `refactor`: UI assessment defaults to "refresh" or "discard" (architecture being changed; UI usually needs update)
- `scaffold`: UI assessment defaults to "discard" or "reference-only" (new authoring expected)
- `reference`: UI assessment defaults to "reference-only" (architecture says reference; UI follows)

Surface conflicts (Phase 4 says X, Phase 5 wants Y) as design-deltas with `delta_type: cross_phase_alignment`, `recommendation: flag_for_architecture_ADR` (escalate to Phase 6 for resolution).

### 4. Append comparison block per asset to draft

Per asset, append:

```
### <Asset name> (<category>)

**Path:** _input/legacy/...

**Comparison facets:**
- Visual direction match: <yes / no / partial>; <notes>
- Brand voice match: <yes / no / partial>; <notes>
- Tokens compatible: <yes / partial / no>; <notes>
- Tech-stack implementable: <yes / no>; <notes>
- A11y baseline met: <yes / no>; <notes>

**Phase 4 cross-reference:** <module decision: keep / refactor / scaffold / reference / N/A>

**Preliminary decision recommendation:** <keep / refresh / discard / reference-only>
```

### 5. Partial-completion clean

`at: "compared"`.

## Output

- Per-asset comparison block authored
- Phase 4 cross-references logged
- Preliminary decisions queued for Step 3 user review

## Navigation

→ Next: [step-03-decisions.md](step-03-decisions.md)
