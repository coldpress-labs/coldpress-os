---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load breakdown-scope + PRD + architecture + UX-spec from graph; existence_checks"
halts_for_input: false
next_step: "step-01-prerequisites.md"
partial_completion_id: "create_epics_step_00"
---

## Goal

Load Phase 7 epic-authoring context directly (`breakdown-entry-sync`'s scope-memo cache was retired, WS5-B §8 item 6 — read the underlying artefacts instead). Verify prerequisites.

## Instructions

1. Partial-completion: `started`.
2. Context load: `prd-v{latest}`, `architecture-md`, `ux-design-spec-v{latest}`, `personas-v{latest}`, `idea-validation-v{latest}`, `adrs`, `legacy-migration-plan-v{latest}` from their canonical `_context/` paths; archetype mode from `coldpress.yaml`/`.coldpress/state.yaml`; open issues + resolved `architecture_deltas:` from the phase-6-to-7 handoff.
3. Existence checks: PRD locked; architecture locked; phase-6-to-7 handoff exists.
4. Note supersede-check pairs: epic claims vs PRD user-stories; epic component-mapping vs architecture components.
5. Partial-completion: `context_loaded`.

## Navigation

→ Next: [step-01-prerequisites.md](step-01-prerequisites.md)
