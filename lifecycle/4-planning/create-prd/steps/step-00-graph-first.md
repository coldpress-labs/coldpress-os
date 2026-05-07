---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load Phase 2+3 evidence bundle from graph; cold-read planning-scope; check for existing PRD"
halts_for_input: false
next_step: "step-01-init.md"
partial_completion_id: "create_prd_step_00"
---

## Goal

Load the full planning context from the graph (populated by `planning-entry-sync`) before PRD authoring begins. This step establishes the evidence foundation that `create-prd` builds on — it does NOT re-run `planning-entry-sync`.

## Instructions

### Graph Queries

1. Query the graph for:
   - Full Phase 2+3 project context summary
   - Persona nodes: archetypes, pain points, accessibility targets, device targets
   - Idea-validation nodes: North Star, riskiest assumptions, success metrics, resolved/open status
   - Product-brief nodes: users, value prop, positioning, competitive context
   - Stack decision nodes: ADR summaries per decision area
   - Baseline constraint nodes: from `planning-scope-v{N}.md active_baselines` — what constraints apply to NFRs
   - Legacy module nodes (if `legacy-assessment` ran): which modules are keep/refactor/scaffold/reference

### Cold File Read

2. Cold-read `_context/planning/planning-scope-v{N}.md` (most recent version):
   - Extract: `archetype_mode`, `evidence_bundle` status, `active_baselines`, `inherited_risks`
   - If file missing: warn — "planning-scope memo not found. Run `planning-entry-sync` before `create-prd`. Continuing in degraded mode."

### Existence Checks

3. Check:
   - `_context/sacred/prd.md` — exists or not (informs mode detection in Step 1)
   - `_context/sacred/prd.meta.json` — exists or not (may be stale from prior run)

### Supersede-Check Setup

4. Note the following pairs for supersede-check monitoring in Steps 2–4:
   - PRD goal claims vs `context.md` primary problem statement
   - PRD requirements vs `tech-stack.md` locked decisions
   - PRD NFRs vs `coldpress.yaml baselines:` confirmed / opted-out categories
   - PRD feature assumptions vs `idea-validation-v{N}` risky-assumption list

### Partial Completion Write

5. Write `partial_completion: { step_id: "create_prd_step_00", at: "context_loaded" }` to `coldpress.yaml`.

## Output

- Phase 2+3 evidence bundle loaded from graph
- Planning-scope memo cold-read
- PRD existence status known
- Supersede-check pairs noted for Steps 2–4

## Navigation

→ Next: [step-01-init.md](step-01-init.md)
