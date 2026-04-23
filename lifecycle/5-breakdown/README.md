---
phase: 5
name: "Breakdown"
description: "Decompose plans into epics, stories, PERT charts, and sprints"
prerequisites:
  - "Phase 4 (Planning) complete"
  - "_context/sacred/prd.md produced and validated"
  - "_context/sacred/architecture.md produced and validated"
outputs:
  - "_context/planning/epics.md"
  - "_context/implementation/{story-key}.md (story files)"
  - "_context/sacred/pert-chart.md (SACRED)"
  - "_context/tracking/sprint-status.yaml"
next_phase: "6-implementation"
---

# Phase 5: Breakdown

> Decompose the plan into actionable work. Every requirement becomes an epic, every epic becomes stories, every dependency becomes visible, and every sprint becomes trackable.

## What Happens Here

1. **Create Epics** -- Break PRD requirements into user-value-focused epics with acceptance criteria
2. **Create Stories** -- Build comprehensive story context files that prevent AI implementation mistakes
3. **Parallelization Strategy** -- Analyze dependencies, build DAG, generate PERT chart with critical path
4. **Sprint Planning** -- Generate sprint-status.yaml tracking file from epics
5. **Implementation Readiness** -- Gate check: validate all artifacts are complete and consistent

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [create-epics](create-epics/) | workflow | pm | Break PRD into user-value-focused epics and stories |
| [create-stories](create-stories/) | workflow | pm | Build comprehensive story context files for implementation |
| [parallelization-strategy](parallelization-strategy/) | workflow | scrum-master | Analyze dependencies, build DAG, generate PERT chart |
| [sprint-planning](sprint-planning/) | workflow | scrum-master | Generate sprint-status.yaml tracking file |
| [implementation-readiness](implementation-readiness/) | workflow | qa | Gate check for implementation readiness |

## Entry Conditions

- Phase 4 complete (planning finished)
- `_context/sacred/prd.md` exists and is validated
- `_context/sacred/architecture.md` exists and is validated
- User is confident in the plan and ready to break it down

## Exit Conditions

- All FRs mapped to epics and stories
- PERT chart generated with critical path and wave grouping
- `sprint-status.yaml` tracking all work items
- Implementation readiness gate passed (READY status)

## Recommended Flow

```
create-epics (break PRD into epics and stories)
  |
create-stories (build context files per story, repeat as needed)
  |
parallelization-strategy (dependency analysis, PERT chart)
  |
sprint-planning (generate sprint-status.yaml)
  |
implementation-readiness (gate check)
  |
-> Phase 6: Implementation
```

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial Phase 5 definition |
