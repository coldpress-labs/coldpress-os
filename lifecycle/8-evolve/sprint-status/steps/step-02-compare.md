---
step_number: 2
step_name: "Compare Against Plan"
step_goal: "Compare actual progress against PERT chart and sprint goals"
halts_for_input: false
next_step: "step-03-recommend.md"
---

## Instructions

1. **Load the plan:**
   - Read `_context/tracking/pert-chart.md` (SACRED) — expected wave schedule and critical path
   - Read `_context/tracking/sprint-plan.yaml` — current sprint scope and goals

2. **Calculate velocity:**
   - Stories completed this sprint vs planned
   - Story points (if tracked) completed vs planned
   - Trend: accelerating, steady, or decelerating compared to previous sprints

3. **PERT comparison:**
   - Current wave: expected vs actual
   - Stories on critical path: on track, at risk, or blocked?
   - Parallel streams: any that have stalled?

4. **Sprint goal assessment:**
   - Which sprint goals are met, in progress, or at risk?
   - Any goals that should be deferred?

5. **Flag deviations:**
   - If velocity is below plan: estimate revised completion date
   - If scope has changed: note additions/removals since sprint start
   - If blockers exist: identify who/what is blocking

## Output

Plan comparison complete. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-recommend.md](step-03-recommend.md)
