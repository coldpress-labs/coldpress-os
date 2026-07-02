---
step_number: 1
step_name: "Flagged-Deltas Intake (Silent-Divergence Guard)"
step_goal: "Consume architecture_adrs_required[] from phase-5-to-6 handoff; queue required ADRs for Step 5 authoring"
halts_for_input: false
next_step: "step-02-overview.md"
partial_completion_id: "architecture_design_step_01"
---

## Goal

CRITICAL step — implements the silent-divergence guard from Phase 5 deep-dive §7.4. Phase 5 reconciliation may have resolved some `design_delta` entries as `flag_for_architecture_ADR` (PRD stays unchanged; design diverges; Phase 6 must absorb the delta as architectural decision). Without this step + the corresponding gate check, divergence is silent. With it, divergence becomes auditable architectural-decision provenance.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "architecture_design_step_01", sub_skill: "flagged_deltas_intake", at: "started" }`.

### 2. Read architecture_adrs_required[] from phase-5-to-6 handoff

Parse the cached handoff (loaded at Step 0). Look for `## Architecture ADRs required` section (per phase-handoff schema extension from Phase 5 Wave 5.8a). Each entry contains:

```yaml
- delta_id: <e.g., delta-007>
  prd_section_affected: <e.g., "User Stories §US-7">
  design_decision_taken: <description from Phase 5 reconciliation>
  architecture_implication: <description>
  prd_amendment_deferred_reason: <why PRD wasn't amended; why Phase 6 absorbs instead>
```

If the section is absent OR empty: log `flagged_deltas_count: 0` and proceed (no required ADRs; only organic ADRs at Step 5).

### 3. Queue required ADRs

For each entry, queue an ADR-author task:

```yaml
queued_required_adr:
  source_delta_id: <delta_id>
  pre_populated_fields:
    resolves_design_delta: <delta_id>
    prd_section_affected: <from entry>
    design_decision_taken: <from entry>
    architecture_implication: <from entry>
    prd_amendment_deferred_reason: <from entry>
  status: queued
  to_be_authored_at_step: 5
```

Store the queue in step-state (`_partial_completion_state.required_adrs_queue: [...]`).

### 4. Surface count to user

> **Phase 5 flagged-deltas requiring ADRs:** {count}.
>
> {if >0:}
> The following design-deltas were flagged for ADR by Phase 5 reconciliation. Phase 6 will author one ADR per delta at Step 5:
>
> {list per delta_id + prd_section_affected + 1-line summary}
>
> Phase 6 cannot exit until each has its corresponding ADR (silent-divergence guard, gate check #5 block-severity).
>
> {if 0:}
> No flagged deltas. Phase 6 will author only organic ADRs at Step 5.

### 5. Gate-check pre-warning

If count > 0, set local flag `silent_divergence_guard_active: true`. Step 5 ADR-author MUST author all queued ADRs before allowing skill exit. Step 6 emit verifies count matches gate check #5 expectations.

### 6. Partial-completion clean

`at: "deltas_queued: <count>"`.

## Output

- `architecture_adrs_required[]` array consumed
- Required ADRs queued for Step 5 authoring
- Silent-divergence guard active flag set (if count > 0)

## Navigation

→ Next: [step-02-overview.md](step-02-overview.md)
