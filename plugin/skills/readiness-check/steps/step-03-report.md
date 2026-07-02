---
step_number: 3
step_name: "Generate Report"
step_goal: "Produce readiness report with pass/fail verdict"
halts_for_input: true
next_step: "complete"
---

## Instructions

1. **Compile gate results** into readiness report.
2. **Issue verdict:** READY TO DEPLOY / NEEDS FIXES / NOT READY.
3. **List critical failures** requiring immediate fix.
4. **Present to user.**

## Output

Readiness report written. Workflow complete.

## Navigation

→ Workflow complete. If READY → deploy.
