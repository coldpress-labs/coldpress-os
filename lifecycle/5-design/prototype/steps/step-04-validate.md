---
step_number: 4
step_name: "Validate (adversarial-review + tech-stack imports + manifest emit)"
step_goal: "adversarial-review on prototype; verify tech-stack imports; finalise manifest; aggregate design-deltas"
halts_for_input: true
next_step: null
partial_completion_id: "prototype_step_04"
---

## Goal

Final validation. Wire `adversarial-review`. Verify tech-stack imports (code-skeleton mode). Schema-validate manifest. Emit final manifest.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "prototype_step_04", sub_skill: "validate", at: "started" }`.

### 2. Adversarial-review wire-in

Invoke `adversarial-review` against the prototype directory. Method: red-team / pre-mortem. Common challenges:
- "What if persona uses primary nav 90% of the time but prototype emphasises search?"
- "What if mobile users dominate but clickable-html is desktop-only?"
- "What if a token referenced doesn't exist in brand-guidelines?"
- "What if a screen omits a flow step from ux-design-spec?"

User reviews; accept (revise prototype) or reject with rationale.

### 3. Tech-stack imports verification (code-skeleton mode only)

For each entry in `manifest.tech_stack_imports[]`:

- Check against `tech-stack-md.dependencies` (npm packages, cargo crates, gem packages, etc.)
- If missing: surface as design-delta:
  ```yaml
  - id: delta-XXX
    source_skill: prototype
    source_step: step-04-validate
    prd_section: "n/a (architecture concern)"
    delta_type: additive
    description: "Prototype imports `<library>` which is not in tech-stack.dependencies."
    evidence: "<file>:<line> imports `<library>`"
    reconciliation_options: [accept_into_prd, reject, flag_for_architecture_ADR, park_for_phase_11]
    recommendation: flag_for_architecture_ADR
  ```

Append to design-deltas WIP log.

User reviews each import-conflict: scope-reduce prototype OR Phase 6 ADR.

### 4. Acceptance criteria coverage

For each PRD user-story-ID, check `manifest.acceptance_criteria_referenced[]` includes at least one entry. Uncovered ACs: surface as design-deltas (additive — prototype scope gap or PRD ambiguity).

### 5. Schema-validate manifest

Validate `manifest.json` against `schemas/design/prototype-manifest.schema.json`. Fix or surface failures.

### 6. Finalise manifest

Update fields:
- `validated_at: <ISO>`
- `status: validated`
- `design_deltas_surfaced: <count>`
- `adversarial_review_findings: <count>`
- `acceptance_criteria_coverage: <covered>/<total>`
- `tech_stack_import_failures: <count>` (post-resolution should be 0 or all flagged with ADR-required marker)

### 7. Update graph

Add/update node `prototype-{date}` with manifest properties.

### 8. Partial-completion clean

`at: "validated"`. Clear partial_completion entirely.

## Output

- Manifest finalised + schema-validated
- Tech-stack imports verified (or surfaced as ADR-required deltas)
- Acceptance-criteria coverage logged
- adversarial-review findings logged
- Graph node updated

## Navigation

→ Phase 5 continues — optionally invoke `skills/creative/storytelling` directly for narrative/brand-voice work (after brand-guidelines available — typically already done by this point; the dedicated `narrative` wrapper skill was retired, WS5-B §8 item 6).
