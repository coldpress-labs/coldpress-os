# DAG Parser — Dependency Graph Definition

> How to define task dependency graphs for the orchestrator.

---

## What is a DAG?

A **Directed Acyclic Graph** maps tasks and their dependencies. Each task declares what it depends on. The graph must have no cycles (task A depends on B which depends on A is invalid).

## DAG Definition Format

DAGs are defined in YAML using this schema:

```yaml
# orchestration/dag.yaml
dag:
  id: "{project-slug}-{scope}"
  scope: "epics"                    # epics, research, planning, tests, deployment
  created: "2026-04-13"
  
  tasks:
    - id: "task-1"
      name: "Task Name"
      depends_on: []                # No dependencies — starts in Wave 1
      estimated_duration: "2w"      # Duration estimate
      agent: "developer"                 # Primary agent (optional)
      
    - id: "task-2"
      name: "Another Task"
      depends_on: ["task-1"]        # Depends on task-1
      estimated_duration: "2w"
      agent: "developer"
      
    - id: "task-3"
      name: "Parallel Task"
      depends_on: ["task-1"]        # Also depends on task-1 (parallel with task-2)
      estimated_duration: "1w"
      agent: "ux-designer"
```

## Task Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique task identifier (kebab-case) |
| `name` | string | Yes | Human-readable task name |
| `depends_on` | string[] | Yes | List of task IDs this task depends on (empty = no deps) |
| `estimated_duration` | string | No | Duration estimate (e.g., "2w", "3d", "4h") |
| `agent` | string | No | Primary agent persona for this task |
| `description` | string | No | Brief description of the task |
| `output` | string | No | Expected output artifact |

## Parsing Rules

1. **Validate no cycles.** Perform cycle detection. If a cycle exists, halt and report the cycle path.
2. **Validate all references.** Every ID in `depends_on` must correspond to an existing task `id`.
3. **Identify root tasks.** Tasks with `depends_on: []` are roots — they start in Wave 1.
4. **Validate connectivity.** Warn if any task is completely disconnected (no deps AND nothing depends on it).

## How to Build a DAG

### For Epics (Phase 5-6)

Read the epics document and identify dependencies:
- Does Epic 2 use anything built in Epic 1? → `depends_on: ["epic-1"]`
- Can Epic 3 and Epic 4 run simultaneously? → Give them the same dependency set
- Ask: "If I deleted this epic's code, would that other epic still work?"

### For Research (Phase 2)

Research streams are typically independent:
```yaml
tasks:
  - id: "domain-research"
    depends_on: []
  - id: "market-research"
    depends_on: []
  - id: "technical-research"
    depends_on: []
  - id: "synthesis"
    depends_on: ["domain-research", "market-research", "technical-research"]
```

### For Planning (Phase 4)

Planning has partial dependencies:
```yaml
tasks:
  - id: "product-brief"
    depends_on: []
  - id: "design-brief"
    depends_on: ["product-brief"]       # Bridge mode imports product brief
  - id: "create-prd"
    depends_on: ["product-brief"]       # Needs product brief as input
  - id: "create-ux-design"
    depends_on: ["create-prd"]          # Needs PRD for user flows
  - id: "create-architecture"
    depends_on: ["create-prd"]          # Needs PRD for technical design
```

## Anti-Patterns

- **Over-constraining:** Don't add dependencies unless one task truly needs the other's output. More dependencies = less parallelism.
- **Under-constraining:** Don't omit dependencies that exist. Running tasks out of order produces broken output.
- **Circular reasoning:** If two tasks seem to depend on each other, one of them needs to be split.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial DAG parser spec |
