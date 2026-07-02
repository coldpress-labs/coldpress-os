---
step_number: 1
step_name: "Initialize"
step_goal: "Load context and detect operating mode (create/edit/validate)"
halts_for_input: true
next_step: "step-02-vision.md"
---

## Goal

Load all available context documents and determine which operating mode to use: create (c), edit (e), or validate (v).

## Instructions

### Read Planning Scope

1. From the `planning-scope-v{N}.md` cold-read in Step 0, extract:
   - `archetype_mode` — determines default flow (`standard-pm` / `vibe-coder-lean` / `design-first`)
   - `evidence_bundle` status — which Phase 2+3 artefacts are present
   - `active_baselines` — which NFR constraints apply

### Detect PRD Mode

2. **Detect PRD operating mode:**
   - If `_context/sacred/prd.md` does NOT exist (from Step 0 existence check): **create (c)** mode — default
   - If `_context/sacred/prd.md` exists: ask user — edit (e) or re-validate (v)?
   - User can always override with an explicit mode flag

3. **Confirm archetype mode affects flow:**
   - `vibe-coder-lean`: abbreviated flow — focus on core user stories and critical requirements; skip exhaustive NFR sections
   - `design-first`: design-brief already done; import design decisions as constraints in Step 3
   - `standard-pm`: full flow as specified

### Summarise Context

4. Present a brief context summary from Step 0 graph load:
   - "I have: [list present artefacts ✓]"
   - "Missing: [list missing artefacts ⚠ with impact notes]"
   - "Active baselines: [list] → these become non-negotiable NFRs in Step 3"
   - Confirm readiness with user

### Partial Completion Write

5. Write `partial_completion: { step_id: "create_prd_step_01", at: "mode_confirmed" }` to `coldpress.yaml`.

## Output

Planning-scope read, PRD mode determined, archetype mode confirmed, context summarised.

## Navigation

-> Proceed to [step-02-vision.md](step-02-vision.md)

## Navigation

-> Proceed to [step-02-vision.md](step-02-vision.md)
