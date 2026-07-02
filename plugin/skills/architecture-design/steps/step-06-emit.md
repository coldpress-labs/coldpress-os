---
step_number: 6
step_name: "Emit Sacred Architecture + Sidecar"
step_goal: "Final supersede-check sweep; adversarial-review + editorial; schema-validate; emit architecture.md (sacred) + sidecar"
halts_for_input: true
next_step: null
partial_completion_id: "architecture_design_step_06"
---

## Goal

Final step. Run sacred-doc supersede-check. Wire `adversarial-review` + `editorial` + `editorial`. Schema-validate. Emit architecture.md as sacred + emit sidecar.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "architecture_design_step_06", sub_skill: "emit", at: "started" }`.

### 2. Final supersede-check sweep (sacred-doc level)

Across the full architecture.md draft, run all supersede pairs:

- Architecture component vs PRD feature (every PRD user-story has component)
- Architecture data flow vs UX flow (every UX flow has implementable data flow)
- Architecture integration vs tech-stack.dependencies
- Architecture NFR strategy vs coldpress.yaml baselines
- Architecture decisions vs prior ADRs

Any supersede-check failure: surface to user. Options:
- Revise architecture (return to relevant earlier step)
- Re-enter Phase 3 to amend tech-stack via ADR
- Re-enter Phase 5 to amend UX-spec
- Surface as architecture-delta (forward-carry) IF the gap is PRD-targeted (route through reconciliation pass — mechanism deferred)

### 3. Adversarial-review wire-in

Invoke `adversarial-review` against the full architecture.md draft. Method: red-team / pre-mortem. Common challenges:
- "What happens at 10x persona scale?"
- "What if the riskiest assumption from idea-validation is wrong?"
- "What integration boundary is most likely to fail catastrophically?"
- "What architectural decision is most regrettable in 2 years?"

User reviews; accept (revise) or reject with rationale.

### 4. Editorial-structure wire-in

Invoke `editorial` against architecture.md. Section ordering, header hierarchy, scannable structure, ADR-Index completeness.

### 5. Editorial-prose wire-in

Already applied to ADRs at Step 5. Apply to architecture.md prose sections (System Purpose, Style Rationale, NFR strategies) here.

### 6. Schema-validate

Validate architecture.md frontmatter against `schemas/sacred-docs/architecture.schema.json`. Fix or surface failures.

### 7. Final silent-divergence-guard verification

Re-verify (final pass before emit) that every entry in `phase-5-to-6 handoff.architecture_adrs_required[]` has a corresponding ADR. Block if any missing.

### 8. Set `governance: requires-review` and finalise frontmatter

```yaml
---
sacred: true
governance: requires-review        # Was 'draft'; now requires user review before locking
last_modified: <ISO>
status: pending_review
---
```

### 9. Emit architecture.meta.json sidecar

```json
{
  "$schema": "schemas/handoffs/architecture-meta.schema.json",
  "schema_version": 1,
  "version": "1.0",
  "validated_at": "<ISO>",
  "sources": {
    "prd": "<v>",
    "ux_design_spec": "<v>",
    "brand_guidelines": "<v>",
    "tech_stack": "<v>"
  },
  "component_count": <N>,
  "integration_count": <N>,
  "nfr_axes_addressed": [...],
  "adrs_authored": [<adr_numbers>],
  "brownfield_modules_handled": <N>,
  "flagged_deltas_resolved": <N>,
  "adversarial_review_findings": <N>,
  "editorial_findings": <N>
}
```

Write to `_context/sacred/architecture.meta.json`.

### 10. Architecture-deltas (if any surfaced during Phase 6)

If Phase 6 surfaced any `architecture_delta` candidates (PRD-targeted gaps), record them in handoff log staging area (`_context/handoffs/phase-6-architecture-deltas-wip-{date}.md`). Mechanism is mostly deferred (forward-carry), but recording the gap is cheap.

### 11. Update graph

Add/update node `architecture-md` with version, status, validated_at, source_versions, ADR list.

### 12. Partial-completion clean

`at: "emitted"`. Clear partial_completion entirely.

### 13. User review prompt

> **Architecture authored.** Sacred document at `_context/sacred/architecture.md` (status: pending_review).
> Sidecar at `_context/sacred/architecture.meta.json`.
> ADRs at `_context/planning/adrs/adr-NNN-*.md` ({total} total — {required} required from flagged deltas + {organic} organic).
>
> Please review the architecture document. To accept, set `governance: locked` (via amendment workflow) and re-run gate evaluation. To revise, return to the relevant step.

## Output

- `_context/sacred/architecture.md` (sacred; status: pending_review; supersede-check verified)
- `_context/sacred/architecture.meta.json` sidecar
- All ADRs persisted
- Architecture-deltas WIP log (if any)
- Graph updated
- Silent-divergence guard verified at gate

## Navigation

→ Phase 6 ends. `phase-transition` invoked next (gate evaluation; handoff log emit; Pattern 7 #6 + #7 transitions).
