---
step_number: 0
step_name: "Context"
step_goal: "Load PRD + architecture + UX-spec + tokens/styleguide + api-contract + security-registry + analytics-plan from the handoff"
halts_for_input: false
next_step: "step-01-epics.md"
---

## Goal

Assemble everything the slice needs so stories can be authored as contracts.

## Instructions

1. **Read the phase-6-to-7 handoff** — component map, registry, contract-extraction candidates. Architecture-deltas are already reconciled (Phase 6 exit).
2. **Load the spec surface:**
   - `_context/sacred/prd.md` (requirement IDs + acceptance criteria + priority; content inventory if content-led) — may be v(N+1).
   - `_context/sacred/architecture.md` (components, three-way keyed).
   - `_context/architecture/api-contract` (→ contract stories), `security-registry.yaml` (→ risk forcing), `analytics-plan` (→ events on stories), `data-model` (→ migration stories).
   - `_context/design/{tokens.json, styleguide.md, ux-spec.md}` (→ UI story styleguide refs).
3. **Confirm prerequisites** — PRD locked, architecture sacred+locked. Halt if a required input is missing.

## Output

Context loaded. → [step-01-epics.md](step-01-epics.md).
