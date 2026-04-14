---
type: "pert-chart"
project: "{project-name}"
generated: "{date}"
start_date: "{start-date}"
sacred: true
---

# PERT Chart — {Project Name}

> This is a **sacred document**. Changes require governance approval.

## Timeline Summary

| Metric | Value |
|--------|-------|
| Total tasks | {N} |
| Total waves | {N} |
| Sequential estimate | {N} weeks |
| Parallel estimate | {N} weeks |
| Speedup | {X}x faster |
| Critical path | {task-1 → task-N} |
| Projected start | {date} |
| Projected end | {date} |

## Wave Schedule

| Wave | Tasks | Duration | Start | End | Gate Criteria | Status |
|------|-------|----------|-------|-----|---------------|--------|
| 1 | {task list} | {duration} | {date} | {date} | {criteria} | pending |
| 2 | {task list} | {duration} | {date} | {date} | {criteria} | pending |
| 3 | {task list} | {duration} | {date} | {date} | {criteria} | pending |

## Critical Path

```
{task-1} ({duration}) → {task-2} ({duration}) → {task-N} ({duration}) = {total} total
```

Tasks on the critical path have zero slack — any delay directly extends the project.

## Task Detail

| Task | Wave | Duration | Earliest Start | Earliest Finish | Slack | Critical? |
|------|------|----------|---------------|-----------------|-------|-----------|
| {task-id} | {N} | {duration} | W{N} | W{N} | {slack} | {Yes/No} |

## Human Gate Points

- **Gate 1** (after Wave 1): {criteria}
  - Status: pending
  - Approved: —
  - Notes: —

- **Gate 2** (after Wave 2): {criteria}
  - Status: pending
  - Approved: —
  - Notes: —

## Dependency Diagram

```
Wave 1:  [task-1]
              ↓
Wave 2:  [task-2] ── [task-3]
              ↓           ↓
Wave 3:  [task-4] ── [task-5]
```

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {date} | {agent} | Initial PERT chart generation |
