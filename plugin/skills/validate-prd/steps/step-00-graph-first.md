---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load PRD content and validation context from graph before starting validation"
halts_for_input: false
next_step: "step-01-load.md"
partial_completion_id: "validate_prd_step_00"
---

## Goal

Load the PRD and its supporting context from the graph so validation can compare claims against the Phase 2+3 evidence base — not just raw document reads.

## Instructions

### Graph Queries

1. Query the graph for:
   - PRD content summary: sections, requirements list, feature list, NFRs
   - Context nodes: project goals, problem statement, North Star
   - Tech-stack and ADR nodes: locked decisions per area (for feasibility check)
   - Baseline constraint nodes: active baselines + constraints (for NFR alignment)
   - Idea-validation nodes: risky assumptions list (confirmed resolved vs open)
   - Planning-scope nodes: archetype mode, evidence bundle status

### Existence Checks

2. Check:
   - `_context/sacred/prd.md` — must exist; if missing halt and suggest `create-prd`
   - `_context/sacred/prd.meta.json` — present or missing (impacts gate.json check)
   - `_context/planning/planning-scope-v{N}.md` — for context

### Partial Completion Write

3. Write `partial_completion: { step_id: "validate_prd_step_00", at: "context_loaded" }` to `coldpress.yaml`.

## Output

- PRD and context loaded from graph
- Existence checks complete
- Validation ready to proceed

## Navigation

→ Next: [step-01-load.md](step-01-load.md)
