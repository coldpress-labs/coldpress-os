---
step_number: 1
step_name: "Scope Confirm + Persona Direct-Read"
step_goal: "Confirm scope; read personas-v{latest} directly (not via PRD); initialise output document scaffolding"
halts_for_input: false
next_step: "step-02-flows.md"
partial_completion_id: "ux_design_step_01"
---

## Goal

Confirm Phase 5 scope from planning-scope-memo. Read `personas-v{latest}` directly (NOT the PRD-derived persona section). Read `idea-validation-v{latest}` riskiest_assumptions for UX-test prioritisation. Initialise output document.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "ux_design_step_01", sub_skill: "scope_persona_load", at: "started" }`.

### 2. Read planning-scope memo (Phase 4 entry-sync output)

Cold-read `_context/planning/planning-scope-v{N}.md`. Extract: `archetype_mode`, `evidence_bundle`, `inherited_risks`. Note risks that affect UX (e.g., "users have low connectivity" → must spec offline behaviour in Step 4).

### 3. Persona DIRECT read (fixes B5)

Cold-read `_context/planning/personas-v{latest}.md` (full content) — NOT the PRD-derived persona section. The first-class persona artefact has more depth than the PRD's summary:
- Full archetype descriptions
- Accessibility specifics (vision/motor/cognitive needs)
- Device targets (screen sizes, input modalities)
- Language/locale targets

### 4. Read idea-validation riskiest_assumptions

Cold-read `_context/planning/idea-validation-v{latest}.md`. Extract `riskiest_assumptions` list. UX flows in Step 2 should prioritise testing these assumptions (e.g., "users will figure out the search interface in <30s" → flow + screen design must surface searchability).

### 5. Initialise output document

Create `_context/design/ux-design-spec-v{N}.md` with frontmatter:

```yaml
---
schema: schemas/design/ux-design-spec.schema.json
phase: 5
version: <N>
sources:
  prd: prd-v{prd_version}
  design_brief: design-brief-v{db_version}
  personas: personas-v{p_version}
  idea_validation: idea-validation-v{iv_version}
  tech_stack: tech-stack-v{ts_version}
  baselines: <list>
  archetype: <mode>
created_at: <ISO>
status: draft
distillate: true
sacred: false
---

# UX Design Specification

## 1. Design Overview

### Design Principles

(authored in Step 4)

### User Personas (full archetypes)

(populated by Step 1 — full personas, not PRD-derived)
```

### 6. Populate Section 1.2 (full personas)

Copy persona archetypes from `personas-v{latest}.md` into Section 1.2 of the draft. Each persona: name, role/context, primary goals, key constraints (a11y/device/language), pain points relevant to product.

### 7. Partial-completion clean

`at: "scope_persona_loaded"`.

## Output

- planning-scope memo loaded
- Personas direct-read (fixes B5)
- riskiest_assumptions captured
- Output document scaffolded; Section 1.2 populated

## Navigation

→ Next: [step-02-flows.md](step-02-flows.md)
