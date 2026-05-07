---
step_number: 3
step_name: "Validate + Emit Distillate"
step_goal: "editorial-prose polish; schema-validate; emit validated-distillate + sidecar"
halts_for_input: true
next_step: null
partial_completion_id: "narrative_step_03"
---

## Goal

Polish narratives via `editorial-prose`. Schema-validate. Emit validated-distillate.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "narrative_step_03", sub_skill: "validate_emit", at: "started" }`.

### 2. Editorial-prose wire-in

Invoke `editorial-prose` against the full narrative document. User reviews suggestions; accept (revise) or reject.

### 3. Voice-consistency final check

Cross-reference each narrative passage with brand-guidelines voice samples. If any passage drifts from brand voice (e.g., persona scenario uses casual register where brand-guidelines voice is formal), flag — user revises.

### 4. Schema-validate

Validate frontmatter against `schemas/design/narrative.schema.json`. Fix or surface failures.

### 5. Write VC panel

Append VC table; v1.0 entry: "Initial narrative authored Phase 5; types: <list>; sources versioned per frontmatter."

### 6. Emit validated-distillate

Move draft to final `_context/design/narrative-v{N}.md`. Set `status: validated`.

Emit sidecar `narrative-v{N}.meta.json`:

```json
{
  "schema_version": 1,
  "version": "<N>",
  "validated_at": "<ISO>",
  "sources": { "personas": "<v>", "brand_guidelines": "<v>", "idea_validation": "<v>", "product_brief": "<v>", "prd": "<v>" },
  "narrative_types": [...],
  "narratives_count": <N>,
  "voice_consistency_check_pass": <bool>,
  "editorial_prose_findings": <count>
}
```

### 7. Update graph

Add/update node `narrative-v{N}` with version, status, validated_at, narrative_types.

### 8. Partial-completion clean

`at: "distillate_emitted"`. Clear partial_completion entirely.

## Output

- `_context/design/narrative-v{N}.md` validated-distillate
- `_context/design/narrative-v{N}.meta.json` sidecar
- Graph node updated

## Navigation

→ Phase 5 continues with `legacy-ui-assessment` (conditional) OR proceeds to Phase 5 exit reconciliation (gate.json post-exit-action invokes phase-transition).
