---
step_number: 2
step_name: "Waves"
step_goal: "Topological sort into parallel waves, identify critical path"
halts_for_input: true
next_step: "step-03-pert.md"
---

## Goal

Group work items into parallel execution waves and identify the critical path.

## Instructions

1. **Topological sort** the DAG to determine valid execution orderings.
2. **Group into waves.** A wave is a set of work items that can all be executed in parallel (no dependencies between them). Wave 1 has no dependencies; Wave 2 depends only on Wave 1 items; etc.
3. **Identify the critical path.** The longest chain of dependent items that determines the minimum total project duration.
4. **Flag bottlenecks.** Items that block the most downstream work.
5. **Identify human gate points.** Points where user review/approval is needed before proceeding (e.g., after foundational epics, before UX-critical features).
6. **Present wave groupings** and critical path to user for validation.

## Output

Waves defined, critical path identified, gate points marked. `step_2_complete: true`

## Navigation

-> Proceed to [step-03-pert.md](step-03-pert.md)
