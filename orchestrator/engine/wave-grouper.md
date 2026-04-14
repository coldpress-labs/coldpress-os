# Wave Grouper — Topological Sort to Parallel Waves

> Transforms a DAG into ordered waves of parallelizable tasks.

---

## Algorithm

### Input
A validated DAG (from dag-parser).

### Process: Kahn's Algorithm (Modified)

```
1. Calculate in-degree for each task (number of unsatisfied dependencies)
2. All tasks with in-degree 0 → Wave 1
3. Remove Wave 1 tasks from the graph
4. Recalculate in-degrees
5. All tasks with in-degree 0 → Wave 2
6. Repeat until all tasks are assigned
```

### Output
An ordered list of waves, each containing tasks that can execute in parallel.

## Example

Given DAG:
```
task-1: depends_on: []
task-2: depends_on: [task-1]
task-3: depends_on: [task-1]
task-4: depends_on: [task-2, task-3]
task-5: depends_on: [task-2]
```

Produces:
```
Wave 1: [task-1]            — 1 task
Wave 2: [task-2, task-3]    — 2 tasks (parallel)
Wave 3: [task-4, task-5]    — 2 tasks (parallel)
```

## Wave Output Format

```yaml
waves:
  - wave_number: 1
    tasks: ["task-1"]
    estimated_duration: "2w"      # Max duration of tasks in wave
    gate_criteria: "Foundation validated"
    
  - wave_number: 2
    tasks: ["task-2", "task-3"]
    estimated_duration: "2w"      # Parallel — takes the longest task's duration
    gate_criteria: "Auth and API layer working"
    
  - wave_number: 3
    tasks: ["task-4", "task-5"]
    estimated_duration: "2w"
    gate_criteria: "Core features complete"
```

## Duration Calculation

- **Wave duration** = max(task durations within the wave)
- **Total parallel duration** = sum(wave durations)
- **Total sequential duration** = sum(all task durations)
- **Speedup factor** = sequential / parallel

## Gate Criteria Generation

For each wave, generate human-readable gate criteria:
- What should be true after this wave completes?
- What artifacts should exist?
- What should be testable or demonstrable?

Gate criteria are **suggestions** — the user defines final criteria during sprint planning.

## Edge Cases

- **Single-task waves:** Valid. Some tasks have unique dependency positions.
- **Very deep DAGs:** Many waves with few tasks each → low parallelism. Consider restructuring.
- **Very wide DAGs:** Few waves with many tasks → high parallelism. Ideal.
- **Disconnected subgraphs:** Tasks with no connections to the main graph get their own wave chain.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial wave grouper spec |
