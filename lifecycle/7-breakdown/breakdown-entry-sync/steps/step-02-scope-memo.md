---
step_number: 2
step_name: "Breakdown-Scope Memo Emit"
step_goal: "Emit breakdown-scope-v{N}.md validated-distillate; editorial-structure; schema-validate"
halts_for_input: true
next_step: null
partial_completion_id: "breakdown_entry_sync_step_02"
---

## Goal

Final step. Emit the breakdown-scope memo that all 5 downstream Phase 7 skills consume.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "breakdown_entry_sync_step_02", sub_skill: "scope_memo", at: "started" }`.

### 2. Author breakdown-scope-v{N}.md

```yaml
---
schema: schemas/planning-artefacts/breakdown-scope.schema.json
phase: 7
version: <N>
created_at: <ISO>
status: draft
distillate: true
sources:
  prd: prd-v{prd_version}
  ux_design_spec: ux-design-spec-v{ux_version}
  brand_guidelines: brand-guidelines-v{bg_version}
  architecture: architecture-md-v{arch_version}
  tech_stack: tech-stack-v{ts_version}
  baselines: <list>
  archetype: <mode>
  legacy_migration_plan: <v|null>
  legacy_ui_assessment: <v|null>
  prototype_manifest: <path>
  adrs: <list of adr_numbers>
architecture_deltas:
  count: <N>
  resolved:
    accept_into_prd: <N>
    reject: <N>
    flag_for_architecture_ADR: <N>
    park_for_phase_11: <N>
  blockers: <list of delta_ids that block — reject + flag_for_architecture_ADR>
prd_amendment_emitted: <bool>
prd_version_after_reconciliation: <v>
---

# Breakdown Scope Memo

## Archetype mode

{archetype} — drives downstream story granularity:
- vibe-coder-lean → thin stories (1-3h, acceptance_criteria)
- standard → medium stories (4-8h, BDD scenarios)
- design-led / WDS → richer stories with explicit UX-screen ref + brand-token use

## Active baselines

{list with levels: a11y WCAG-AA/AAA, perf, SEO, observability — drive testing requirements per story}

## Persona scale targets

{summary from personas-v{N}: concurrent users, geographic distribution, device range}

## Legacy disposition (brownfield only)

- Architecture decisions: {summary from legacy-migration-plan} (keep/refactor/scaffold/reference per module)
- UI decisions: {summary from legacy-ui-assessment} (keep/refresh/discard/reference-only per asset)

## Architecture-deltas reconciliation

- Total: {count}
- Resolved by decision: {breakdown}
- {if blockers: "BLOCKERS — Phase 7 cannot proceed until <list> resolved via Phase 6 re-entry"}

## Prototype manifest reference

{path} — mode: {code-skeleton|mock-spec|clickable-html}; stories should reference manifest files for code-skeleton starting points

## Open issues / risks

{list — for downstream skill awareness}

## ADRs in scope

{list of adr_numbers from Phase 3 + Phase 6 — stories must not contradict}
```

### 3. Editorial-structure wire-in

Invoke `editorial-structure` against the memo. User reviews structure.

### 4. Schema-validate

Validate frontmatter against `schemas/planning-artefacts/breakdown-scope.schema.json`.

### 5. Emit validated-distillate

Move draft to `_context/planning/breakdown-scope-v{N}.md`. Set `status: validated`.

### 6. Update graph

Add/update node `breakdown-scope-v{N}` with version + status + sources + architecture_deltas summary.

### 7. Partial-completion clean

`at: "memo_emitted"`. Clear partial_completion entirely.

## Output

- `_context/planning/breakdown-scope-v{N}.md` validated-distillate
- Graph node updated

## Navigation

→ Phase 7 continues with `create-epics` (downstream skills consume breakdown-scope memo).
