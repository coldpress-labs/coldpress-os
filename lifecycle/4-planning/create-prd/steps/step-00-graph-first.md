---
step_number: 0
step_name: "Context Load"
step_goal: "Load Phase 2+3 evidence bundle directly; check for existing PRD"
halts_for_input: false
next_step: "step-01-init.md"
partial_completion_id: "create_prd_step_00"
---

## Goal

Load the full planning context before PRD authoring begins — read the Phase 2+3 artefacts directly (WS5-B, §8 item 6 — `planning-entry-sync`'s context-load role was retired; there's no longer a separate scope-memo to cold-read). This step establishes the evidence foundation that `create-prd` builds on.

## Instructions

### Context Load

1. Read directly:
   - Phase 2+3 project context summary from `_context/sacred/context.md` + `_context/sacred/tech-stack.md`
   - Persona archetypes, pain points, accessibility/device targets from `_context/planning/personas-v{N}.md`
   - Idea-validation North Star, riskiest assumptions, success metrics from `_context/planning/idea-validation-v{N}.md`
   - Product-brief users, value prop, positioning from `_context/planning/product-brief-v{N}.md`
   - Stack decision ADR summaries from `_context/planning/adrs/`
   - Baseline constraints from `coldpress.yaml baselines:`
   - Legacy module status (if `legacy-assessment` ran) from `_context/planning/legacy-migration-plan-v{N}.md`

### Existence Checks

2. Check:
   - `_context/sacred/prd.md` — exists or not (informs mode detection in Step 1)
   - `_context/sacred/prd.meta.json` — exists or not (may be stale from prior run)

### Supersede-Check Setup

3. Note the following pairs for supersede-check monitoring in Steps 2–4:
   - PRD goal claims vs `context.md` primary problem statement
   - PRD requirements vs `tech-stack.md` locked decisions
   - PRD NFRs vs `coldpress.yaml baselines:` confirmed / opted-out categories
   - PRD feature assumptions vs `idea-validation-v{N}` risky-assumption list

### Partial Completion Write

4. Write `partial_completion: { step_id: "create_prd_step_00", at: "context_loaded" }` to `coldpress.yaml`.

## Output

- Phase 2+3 evidence bundle loaded directly from `_context/` artefacts
- PRD existence status known
- Supersede-check pairs noted for Steps 2–4

## Navigation

→ Next: [step-01-init.md](step-01-init.md)
