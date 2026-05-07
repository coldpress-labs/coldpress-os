---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load breakdown-scope + PRD + architecture + UX-spec from graph; existence_checks"
halts_for_input: false
next_step: "step-01-prerequisites.md"
partial_completion_id: "create_epics_step_00"
---

## Goal

Load Phase 7 epic-authoring context from graph (mostly cached by breakdown-entry-sync). Verify prerequisites.

## Instructions

1. Partial-completion: `started`.
2. Graph queries (per SKILL.md): breakdown-scope-v{latest}, prd-v{latest}, architecture-md, ux-design-spec-v{latest}, personas-v{latest}, idea-validation-v{latest}, adrs, archetype-mode, legacy-migration-plan-v{latest}.
3. Existence checks: breakdown-scope exists; PRD locked; architecture locked.
4. Cold-read breakdown-scope memo (for archetype + open issues).
5. Note supersede-check pairs: epic claims vs PRD user-stories; epic component-mapping vs architecture components.
6. Partial-completion: `graph_loaded`.

## Navigation

→ Next: [step-01-prerequisites.md](step-01-prerequisites.md)
