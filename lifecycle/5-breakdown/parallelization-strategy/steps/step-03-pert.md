---
step_number: 3
step_name: "PERT Chart"
step_goal: "Generate PERT chart with estimates, human gate points, and calendar projections"
halts_for_input: true
next_step: null
---

## Goal

Produce the sacred PERT chart document with time estimates and calendar projections.

## Instructions

1. **Estimate durations** for each work item using three-point estimation:
   - Optimistic (O): best case
   - Most Likely (M): typical case
   - Pessimistic (P): worst case
   - Expected: (O + 4M + P) / 6
2. **Calculate wave durations.** Each wave's duration is the max expected duration of its items.
3. **Calculate total project duration** along the critical path.
4. **Generate calendar projections** based on:
   - Assumed work hours per day (ask user)
   - Start date (ask user)
   - Buffer for gate points and review cycles
5. **Write `_output/tracking/pert-chart.md`** with:
   - Dependency DAG (visual representation)
   - Wave groupings table
   - Critical path highlighted
   - Time estimates per item and per wave
   - Calendar projection timeline
   - Human gate points marked
6. **Mark as sacred.** This document is the authoritative execution plan.

## Output

`_output/tracking/pert-chart.md` written (sacred). `step_3_complete: true`

## Navigation

Workflow complete. Proceed to `sprint-planning` to generate sprint-status.yaml.
