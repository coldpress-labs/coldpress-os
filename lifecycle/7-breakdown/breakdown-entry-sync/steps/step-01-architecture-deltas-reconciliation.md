---
step_number: 1
step_name: "Architecture-Deltas Reconciliation Pass"
step_goal: "Consume architecture_deltas[] from phase-6-to-7 handoff; 4-option reconciliation per delta; accept_into_prd → validate-prd --sections lightweight amendment"
halts_for_input: true
next_step: "step-02-scope-memo.md"
partial_completion_id: "breakdown_entry_sync_step_01"
---

## Goal

CRITICAL step. Forward-carry mechanism from Phase 6 §12 — Phase 6 may have surfaced PRD/UX gaps at architecture time and recorded them as architecture-deltas. Phase 7 entry-sync reconciles them at the phase BOUNDARY (per Q2).

This step is also the **first real consumer of `validate-prd --sections=<list>`** lightweight-amendment path that Phase 5 deferred.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "breakdown_entry_sync_step_01", sub_skill: "deltas_reconciliation", at: "started" }`.

### 2. Read architecture_deltas[] from phase-6-to-7 handoff

Parse cached handoff (loaded at Step 0). Look for `## Architecture deltas` section. Each entry uses `schemas/handoffs/design-delta.schema.json` with `source_skill: architecture-design`.

If section absent OR empty: log `architecture_deltas_count: 0` and proceed to Step 2.

### 3. Validate deltas + group by prd_section

Validate each delta against schema. Group by `prd_section` to detect conflicts (multiple deltas targeting same section).

### 4. Per-delta reconciliation prompt (in @pm scope)

For each delta:

> **Architecture Delta {id}** ({delta_type})
>
> Source: architecture-design → {source_step}
> PRD section: {prd_section}
>
> {description}
>
> Evidence: {evidence}
>
> Recommendation: **{recommendation}**
>
> Options:
> 1. accept_into_prd — author PRD v(N+1) lightweight amendment via `validate-prd --sections=<target_sections>`
> 2. reject — architecture must conform to PRD as-is (re-enter Phase 6)
> 3. flag_for_architecture_ADR — Phase 6 missed authoring an ADR; re-enter Phase 6 (USE SPARINGLY — silent-divergence guard breach signal)
> 4. park_for_phase_11 — Phase 11 Evolve will revisit; not now
>
> Choose 1-4 + provide rationale.

Halt for user input. Capture `user_decision` + `user_rationale` per delta.

### 5. Resolve per decision

For each `accept_into_prd` delta:
- Aggregate target_sections across all accept-deltas
- Author `prd-amendment-{N}` payload per `schemas/sacred-docs/prd-amendment.schema.json`
- Edit PRD sections per proposed_diffs
- **Invoke `validate-prd --sections=<target_sections>`** (CRITICAL — first real consumer of this lightweight path)
- On validate-prd pass: bump PRD VC (minor or major per vc_bump_target)
- Update `prd.meta.json`: `prd_version`, `last_amendment_date`, `amendment_source: phase-7-architecture-reconciliation`

For each `reject` delta:
- Block Phase 7 progress until user re-enters Phase 6 to revise architecture
- Log decision; surface as gate-blocker

For each `flag_for_architecture_ADR` delta:
- Surface warning: "this is a silent-divergence-guard breach signal — Phase 6 missed authoring required ADR. Re-enter Phase 6 to author the missed ADR."
- Block Phase 7 progress until Phase 6 re-entry resolves.

For each `park_for_phase_11` delta:
- Append to `_context/audit/product-evolution-backlog.md`
- Log decision

### 6. Update WIP marker

Set each delta's `user_decision`, `user_rationale`, `applied_at`. These move into the breakdown-scope memo (Step 2) for downstream visibility.

### 7. Partial-completion clean

`at: "deltas_reconciled: <count>"`.

## Output

- Each architecture_delta has user_decision set
- accept_into_prd deltas → PRD v(N+1) emitted via lightweight amendment
- flag_for_architecture_ADR deltas → block + Phase 6 re-entry required
- reject deltas → block + Phase 6 re-entry required
- park_for_phase_11 deltas → product-evolution backlog appended

## Navigation

→ Next: [step-02-scope-memo.md](step-02-scope-memo.md)
