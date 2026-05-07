---
step_number: 0
step_name: "Graph-First Context Load + Trigger Check"
step_goal: "Verify trigger condition; load graph context if proceeding; silent skip if no UI legacy"
halts_for_input: false
next_step: "step-01-inventory.md"
partial_completion_id: "legacy_ui_assessment_step_00"
---

## Goal

Conditional skill entry point. Check trigger condition. Silent skip if no UI legacy detected. Load graph context if proceeding.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "legacy_ui_assessment_step_00", sub_skill: "trigger_check", at: "started" }`.

### 2. Trigger condition check

Read `legacy-input.has_ui_assets` from graph (set by `design-brief` Step 0).

If `false` OR `legacy-input` node missing:
- Write `legacy-ui-assessment-skipped: no-ui-legacy-detected` marker into design-deltas WIP log
- Clear partial_completion
- Exit cleanly (skill no-op)

If `true`: proceed to Step 3.

### 3. Graph queries

- `legacy-input` — list of UI/design files discovered under `_input/legacy/`
- `legacy-migration-plan-v{latest}` — Phase 4 architecture decisions (cross-reference)
- `design-brief-v{latest}` — new direction (comparison target)
- `brand-guidelines-v{latest}` — new tokens (token-comparison target if both exist)

### 4. Existence checks

- `design-brief-v{latest}` exists — block: "Run `design-brief` first."

### 5. Cold-read design-brief

Cold-read `_context/planning/design-brief-v{latest}.md` — extract Visual Direction + Brand Voice sections (the comparison target).

### 6. Partial-completion clean

`at: "graph_loaded"`.

## Output

- Trigger resolved (proceed or no-op exit)
- Graph context loaded
- design-brief direction cached for comparison

## Navigation

→ Next: [step-01-inventory.md](step-01-inventory.md)
