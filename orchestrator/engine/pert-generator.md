# PERT Generator — Critical Path and Calendar Projections

> Transforms wave-grouped tasks into a PERT chart with timing analysis.

---

## What PERT Produces

1. **Critical path** — the longest dependency chain that determines project duration
2. **Slack analysis** — which tasks have schedule flexibility
3. **Calendar projections** — estimated start/end dates for each wave
4. **Speedup metrics** — parallel vs sequential comparison

## Process

### Step 1: Forward Pass (Earliest Start/Finish)

For each task in topological order:
- **Earliest Start (ES)** = max(Earliest Finish of all dependencies)
- **Earliest Finish (EF)** = ES + estimated_duration

### Step 2: Backward Pass (Latest Start/Finish)

For each task in reverse topological order:
- **Latest Finish (LF)** = min(Latest Start of all dependents)
- **Latest Start (LS)** = LF - estimated_duration

### Step 3: Slack Calculation

For each task:
- **Slack** = LS - ES (or LF - EF)
- **Critical path** = all tasks with slack = 0

### Step 4: Calendar Projection

Given a start date and working days per week:
- Map wave start/end dates to calendar
- Account for weekends (optional)
- Mark gate approval points on the calendar

## PERT Output Format

```markdown
# PERT Chart — {Project Name}

**Generated:** {date}
**Start Date:** {start_date}
**Projected End:** {end_date}

## Timeline Summary

| Metric | Value |
|--------|-------|
| Total tasks | {N} |
| Total waves | {N} |
| Sequential estimate | {N} weeks |
| Parallel estimate | {N} weeks |
| Speedup | {X}x faster |
| Critical path | {task-1 → task-2 → task-4} |

## Wave Schedule

| Wave | Tasks | Duration | Start | End | Gate |
|------|-------|----------|-------|-----|------|
| 1 | task-1 | 2w | Apr 14 | Apr 25 | Foundation validated |
| 2 | task-2, task-3 | 2w | Apr 28 | May 9 | Auth + API working |
| 3 | task-4, task-5 | 2w | May 12 | May 23 | Core features complete |

## Critical Path

```
task-1 (2w) → task-2 (2w) → task-4 (2w) = 6 weeks total
```

## Task Detail

| Task | Wave | Duration | ES | EF | LS | LF | Slack | Critical? |
|------|------|----------|----|----|----|-------|-------|-----------|
| task-1 | 1 | 2w | W0 | W2 | W0 | W2 | 0 | Yes |
| task-2 | 2 | 2w | W2 | W4 | W2 | W4 | 0 | Yes |
| task-3 | 2 | 1w | W2 | W3 | W3 | W4 | 1w | No |
| task-4 | 3 | 2w | W4 | W6 | W4 | W6 | 0 | Yes |
| task-5 | 3 | 1w | W4 | W5 | W5 | W6 | 1w | No |

## Human Gate Points

- **Gate 1** (after Wave 1): {criteria}
- **Gate 2** (after Wave 2): {criteria}
```

## Sacred Document Status

The PERT chart at `_context/tracking/pert-chart.md` is a **sacred document**. Changes to it trigger the PERT change governance workflow which assesses downstream impact on sprint planning and wave execution.

## When to Regenerate

- After epic dependency changes
- After significant scope changes (correct-course)
- After a wave takes significantly longer/shorter than estimated

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial PERT generator spec |
