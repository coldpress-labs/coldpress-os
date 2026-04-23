# Epic Orchestration Strategy

> Phase 5-6: Parallelizing epic implementation across waves.

---

## When to Use

This is the **primary** orchestration strategy — used whenever a project has multiple epics with dependencies between them.

## How It Works

1. **Input:** Epics document from Phase 5 (create-epics skill)
2. **DAG Construction:** Each epic becomes a task. Dependencies derived from:
   - Data model dependencies (Epic 2 needs tables from Epic 1)
   - API dependencies (Epic 3 needs endpoints from Epic 2)
   - UI dependencies (Epic 4 needs components from Epic 3)
3. **Wave Generation:** Topological sort groups independent epics
4. **PERT Chart:** Generated as sacred document at `_context/tracking/pert-chart.md`
5. **Execution:** Wave-orchestration skill in Phase 6 drives wave-by-wave execution

## Typical DAG Pattern

```yaml
dag:
  scope: "epics"
  tasks:
    - id: "epic-1"
      name: "Foundation & Setup"
      depends_on: []
      estimated_duration: "2w"
      
    - id: "epic-2"
      name: "User Authentication"
      depends_on: ["epic-1"]
      estimated_duration: "2w"
      
    - id: "epic-3"
      name: "Core Feature A"
      depends_on: ["epic-2"]
      estimated_duration: "2w"
      
    - id: "epic-4"
      name: "Core Feature B"
      depends_on: ["epic-2"]          # Parallel with epic-3
      estimated_duration: "2w"
```

## Gate Criteria by Wave

| Wave | Typical Gate Criteria |
|------|---------------------|
| 1 (Foundation) | Project scaffolded, design system working, schema deployed |
| 2 (Core Infrastructure) | Auth flow working, API layer responding, data model stable |
| 3 (Features) | Core features functional, integration tests passing |
| 4 (Polish) | All features complete, E2E tests green, ready for deployment |

## Story-Level Execution Within Epics

Each epic contains stories. Within a wave, stories execute sequentially per epic but epics execute in parallel:

```
Wave 2: [Epic 2, Epic 4]
  Epic 2: Story 2.1 → 2.2 → 2.3 (sequential)
  Epic 4: Story 4.1 → 4.2 (sequential, parallel with Epic 2)
```

## Speedup Expectations

| Project Size | Sequential | Parallel | Typical Speedup |
|-------------|-----------|---------|-----------------|
| 4-6 epics | 8-12 weeks | 4-6 weeks | ~2x |
| 7-10 epics | 14-20 weeks | 6-10 weeks | ~2x |
| 10+ epics | 20+ weeks | 8-12 weeks | ~2-2.5x |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial epic orchestration strategy |
