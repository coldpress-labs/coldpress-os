---
step_number: "2a"
step_name: "Forward-Carry Reconciliation Pass (conditional)"
step_goal: "Phase-aware reconciliation/packaging of forward-carry deltas: design (P5) reconciles in-line; architecture (P6) / implementation (P7-9) / ops (P10) package into next-phase handoff"
severity: "block"
halts_for_input: true
next_step: "step-03-handoff-log.md"
conditional: "from_phase in [5, 6, 7, 8, 9, 10] AND corresponding deltas WIP log has entries"
---

## Goal

Forward-carry quartet reconciliation. Four delta classes feed the lifecycle:
- **design_deltas** — Phase 5 surfaces; **reconciles at Phase 5 EXIT** (this step, full 4-option pass)
- **architecture_deltas** — Phase 6 surfaces; **packages at Phase 6 EXIT** (this step, no prompts) → reconciles at Phase 7 ENTRY (`breakdown-entry-sync` Step 1)
- **implementation_deltas** — Phase 8 surfaces (during dev-story / code-review); **packages at Phase 8 EXIT** (this step, no prompts; pass-through Phases 9 if any) → reconciles at Phase 11 retrospective
- **ops_deltas** — Phase 10 surfaces; **packages at Phase 10 EXIT** (this step, no prompts) → reconciles at Phase 11 retrospective

Phase 5 is the only branch that runs full user-facing reconciliation here. Phases 6-10 are non-interactive packaging steps that move the WIP log into the next-phase handoff for downstream resolution.

## Instructions

### 1. From-phase routing (entry)

Read `from_phase` from local-config / orchestrator context.

| from_phase | Branch | Section |
|---|---|---|
| 5 | Full reconciliation pass (design-deltas + 4-option per-delta prompts + PRD amendment) | §A below |
| 6 | Packaging pass (architecture-deltas → phase-6-to-7 handoff `architecture_deltas[]`) | §B |
| 7 | Packaging pass (implementation-deltas pass-through if any → phase-7-to-8 handoff) | §C |
| 8 | Packaging pass (implementation-deltas → phase-8-to-9 handoff `implementation_deltas[]`; carry forward to Phase 11) | §C |
| 9 | Packaging pass (implementation-deltas pass-through if any → phase-9-to-10 handoff) | §C |
| 10 | Packaging pass (ops-deltas → phase-10-to-11 handoff `ops_deltas[]`) | §D |
| other | Skip — log `reconciliation_skipped: from_phase_not_in_quartet`; proceed to step-03 | — |

Skip the entire step if:
- The corresponding WIP log file does not exist, OR
- The WIP log has zero entries

Log `reconciliation_skipped: <reason>` and proceed to step-03.

---

## §A — Phase 5: Full design-deltas reconciliation pass

### A.1 Aggregate deltas from WIP log

Read `_context/handoffs/phase-5-design-deltas-wip-{date}.md`. Parse each `design_delta` entry. Validate against `schemas/handoffs/design-delta.schema.json`. Surface schema failures (block).

### 2. Aggregate deltas from WIP log

Read `_context/handoffs/phase-5-design-deltas-wip-{date}.md`. Parse each `design_delta` entry. Validate against `schemas/handoffs/design-delta.schema.json`. Surface schema failures (block).

### A.2 Group by prd_section (deduplicate evidence)

Group deltas by `prd_section`. Detect conflicts: multiple deltas targeting the same section with `delta_type: conflicting`. Surface to user before per-delta prompt.

### A.3 Pattern 7 transition: @ux-designer → @pm

Log Pattern 7 transition record:

```yaml
transition:
  trigger: reconciliation_handoff
  from_agent: ux-designer
  to_agent: pm
  rationale: "PRD amendment is @pm's domain (PRD is Phase 4 sacred); design-deltas package handed back for reconciliation."
  warm_handoff: null
  resumes_to: phase-transition
  recorded_at: <ISO>
```

**Append to the Pattern 7 transition buffer** at `_context/handoffs/pattern-7-transitions-wip-{date}.yaml` (NOT the handoff log markdown directly — that gets flushed in step-03 Step 2a). If buffer file does not exist, create it with `phase: <from_phase>` + `created_at: <ISO>` frontmatter. Append the transition block above to the `transitions:` list. See `docs/cross-cutting/pattern-7-agent-personas.md` "Where transitions are recorded" for the buffer convention.

### A.4 Per-delta user prompt (in @pm scope)

For each delta:

> **Design Delta {id}** ({delta_type})
>
> Source: {source_skill} → {source_step}
> PRD section: {prd_section}
>
> {description}
>
> Evidence: {evidence}
>
> Recommendation: **{recommendation}**
>
> Options:
> 1. accept_into_prd — author PRD v(N+1) lightweight amendment
> 2. reject — design must conform to PRD as-is (design artefact will be updated; this re-opens Phase 5 work)
> 3. flag_for_architecture_ADR — carry to Phase 6; ADR mandatory (silent-divergence guard)
> 4. park_for_phase_11 — Phase 11 Evolve will revisit; not now (added to product-evolution backlog)
>
> Choose 1-4 + provide rationale.

Halt for user input. Capture `user_decision` + `user_rationale` per delta.

### A.5 Resolve per decision

For deltas with `user_decision == accept_into_prd`:

**Delegate to `step-02b-prd-amendment-author.md`** — pass the accept_deltas array + `source_phase: 5` + `source_skill: phase-transition` + `current_prd_version`. Step 02b handles: amendment payload authoring + PRD diff application + lightweight validate-prd + VC bump + prd.meta.json update + applied_at marking. See [`step-02b-prd-amendment-author.md`](step-02b-prd-amendment-author.md) for the full sub-step contract.

On 02b return:
- If `amendment_result.status == applied`: continue to remaining decisions below.
- If `amendment_result.status == blocked`: surface to user; do NOT proceed to step-03 until resolved (revise PRD edits or revise upstream user_decision).
- If `amendment_result.status == skipped`: no-op (no accept_into_prd deltas this run).

For each `reject` delta:
- Block Phase 5 exit until source design artefact is revised to comply with PRD as-is
- Loop back to source skill (e.g., re-run ux-design step-04-spec to revise)

For each `flag_for_architecture_ADR` delta:
- Append entry to handoff log's `architecture_adrs_required:` array (will be written by step-03)
- Each entry: `delta_id`, `prd_section_affected`, `design_decision_taken`, `architecture_implication`, `prd_amendment_deferred_reason`
- Phase 6 entry skill MUST consume this section; Phase 6 exit gate REQUIRES corresponding ADRs

For each `park_for_phase_11` delta:
- Append to `_context/audit/product-evolution-backlog.md`
- Mark in handoff log's `parked_for_phase_11:` array

### A.6 Pattern 7 transition: @pm → phase-transition

Append the following block to the Pattern 7 transition buffer (`_context/handoffs/pattern-7-transitions-wip-{date}.yaml`, `transitions:` list):

```yaml
transition:
  trigger: reconciliation_handoff
  from_agent: pm
  to_agent: phase-transition
  rationale: "Reconciliation complete; handing back to phase-transition for handoff log emission."
  warm_handoff: null
  resumes_to: null
  recorded_at: <ISO>
```

### A.7 Update WIP log → mark resolved

Set each delta's `user_decision`, `user_rationale`, `applied_at`. Move/copy WIP log into handoff log's `design_deltas:` section (will be done by step-03).

---

## §B — Phase 6: Architecture-deltas packaging pass

**No user prompts.** Architecture-deltas are surfaced during Phase 6 `architecture-design` and reconciled at Phase 7 ENTRY (`breakdown-entry-sync` Step 1) — not here. This step's job is purely to package the WIP log into the next-phase handoff so Phase 7 entry-sync can find it.

### B.1 Read WIP log

Read `_context/handoffs/phase-6-architecture-deltas-wip-{date}.md`. Validate each entry against `schemas/handoffs/design-delta.schema.json` (reused with `source_skill: architecture-design`). Surface schema failures (block).

### B.2 Forward parked deltas

Forward any deltas that already have `user_decision: park_for_phase_11` (parked during Phase 5 reconciliation and now passing through Phase 6) to the `parked_for_phase_11` array in the phase-6-to-7 handoff (will be written by step-03).

### B.3 Package into handoff payload

Stage the un-resolved (no `user_decision` set) architecture-deltas under `architecture_deltas[]` in the phase-6-to-7 handoff. Step-03 writes this to `_context/handoffs/phase-6-to-7-{date}.md`.

### B.4 No Pattern 7 transition emission

This step does not change agent (@architect remains owner through Phase 6 exit; Phase 6 → 7 entry transition is emitted by step-03). Do NOT write a `reconciliation_handoff` record — that's only for the Phase 5 user-facing reconciliation pass.

---

## §C — Phase 7/8/9: Implementation-deltas packaging pass

**No user prompts.** Implementation-deltas surface during Phase 8 (mainly during `dev-story` and `code-review`); this step handles their pass-through to the next phase. Final reconciliation lands at Phase 11 retrospective.

### C.1 Read WIP log (if exists)

Read `_context/handoffs/phase-{from}-implementation-deltas-wip-{date}.md`. Skip if file doesn't exist (no deltas surfaced this phase). Validate entries against `schemas/handoffs/design-delta.schema.json` (with `source_skill` enum extended for implementation contexts: `dev-story` / `code-review` / `quick-dev`).

### C.2 Forward parked deltas

Forward any deltas with `user_decision: park_for_phase_11` from upstream phases to the next handoff's `parked_for_phase_11` array (cumulative through Phases 5 → 6 → 7 → 8 → 9).

### C.3 Package into next handoff payload

Stage un-resolved implementation-deltas under `implementation_deltas[]` in the phase-{from}-to-{to} handoff. The Phase 11 retrospective will read the full chain (concatenated from Phase 8 onwards) for cause-analysis.

### C.4 No Pattern 7 transition emission

Same as §B.4 — the phase-boundary transitions are emitted by step-03, not here.

---

## §D — Phase 10: Ops-deltas packaging pass

**No user prompts.** Ops-deltas surface during Phase 10 operations (`correct-course`, `sprint-status`, `document-project`); this step packages them for the user-invoked Phase 11 retrospective.

### D.1 Read WIP log

Read `_context/handoffs/phase-10-ops-deltas-wip-{date}.md`. Validate each entry against `schemas/handoffs/ops-delta.schema.json` (specialised reconciliation_options enum: `accept_into_phase_11_retrospective` / `accept_into_phase_11_product_evolution` / `immediate_corrective_action` / `park_for_phase_11`).

### D.2 Verify immediate-corrective-action deltas are done

For any delta with `user_decision: immediate_corrective_action`, verify Phase 10 work resolved them (check `applied_at` is set). If not: BLOCK with warn — "Ops-delta {id} marked immediate_corrective_action but applied_at unset. Resolve before Phase 11 transition or revise user_decision."

### D.3 Forward parked deltas

Forward all deltas (with any user_decision) into the phase-10-to-11 handoff under `ops_deltas[]`. Phase 11 retrospective consumes the full set.

### D.4 No Pattern 7 transition emission

Phase 10 → 11 transition is `phase_entry` for @reviewer, emitted by step-03 (cross-buffer write).

---

## Output

- **Phase 5 (§A):** Each design_delta has user_decision; PRD v(N+1) authored + validated for accept_into_prd; ADR-required markers staged for step-03; product-evolution backlog appended for park_for_phase_11; Pattern 7 reconciliation_handoff pair (#2/#3) logged in buffer.
- **Phase 6 (§B):** architecture_deltas[] packaged into phase-6-to-7 handoff; Phase 5 parked_for_phase_11 carried forward; no agent change.
- **Phase 7-9 (§C):** implementation_deltas[] packaged into next-phase handoff; cumulative parked_for_phase_11 carried forward.
- **Phase 10 (§D):** ops_deltas[] packaged into phase-10-to-11 handoff; immediate_corrective_action deltas verified done.

## Halts For Input

**Phase 5 only:** per-delta decision prompts. User halts once per delta + once for any conflict-group.
**Phases 6-10:** no user halt — packaging is non-interactive. Step proceeds to step-03 immediately after WIP log read + handoff staging.

## Navigation

→ Next: [step-03-handoff-log.md](step-03-handoff-log.md)
