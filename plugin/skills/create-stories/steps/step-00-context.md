---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load breakdown-scope + epics + UX-spec + brand-guidelines + architecture + prototype-manifest + ADRs from graph; existence_checks"
halts_for_input: false
next_step: "step-01-select.md"
partial_completion_id: "create_stories_step_00"
---

## Goal

Load Phase 7 story-authoring context from graph. Verify prerequisites.

## Instructions

1. Partial-completion: `started`.
2. Graph queries (per SKILL.md): breakdown-scope, epics, ux-spec, brand-guidelines, architecture, prototype-manifest, adrs, archetype, legacy-migration-plan, legacy-ui-assessment.
3. Existence checks: epics validated; ux-spec validated; brand-guidelines validated.
4. Cold-read epics + ux-spec (full) + brand-guidelines (tokens block) + architecture (full).
5. Read archetype-mode → set local `granularity_target` per Q5 mapping.
6. Note supersede-check pairs: stories vs (PRD user-stories, UX screens, architecture components, ADR constraints, tech-stack imports).
7. Partial-completion: `graph_loaded`.

## Navigation

→ Next: [step-01-select.md](step-01-select.md)
