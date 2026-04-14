---
step_number: 3
step_name: "Recommend"
step_goal: "Present summary and recommend the next action"
halts_for_input: true
next_step: "complete"
---

## Instructions

1. **Present sprint dashboard:**
   - Progress bar (% complete)
   - Status distribution
   - Risks flagged (from Step 1)
   - Velocity vs plan (from Step 2)
   - Sprint goal status (from Step 2)

2. **Recommend next action** (priority order):
   1. `in-progress` story → continue with dev-story
   2. `review` story → run code-review
   3. `ready-for-dev` story → start dev-story
   4. `backlog` story → run create-stories
   5. Optional retrospective → run retrospective
   6. All done → Congratulations!

3. **Offer to execute** the recommended action.

## Output

Summary presented, action recommended. Workflow complete.

## Navigation

→ Workflow complete.
