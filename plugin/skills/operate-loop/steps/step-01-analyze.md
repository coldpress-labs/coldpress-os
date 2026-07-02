---
step_number: 1
step_name: "Analyze"
step_goal: "Parse sprint-status.yaml and identify current state"
halts_for_input: false
next_step: "step-02-compare.md"
---

## Instructions

1. **Read sprint-status.yaml.**
2. **Count by status:** backlog, ready-for-dev, in-progress, review, done.
3. **Detect risks:**
   - Stories in `in-progress` too long
   - Stories in `review` without recent activity
   - Epics with no in-progress stories
   - Orphaned stories
4. **Calculate progress:** % complete by stories and epics.

## Output

Analysis complete. `step_1_complete: true`

## Navigation

→ Auto-proceed to [step-02-recommend.md](step-02-recommend.md)
