---
step_number: 5
step_name: "Complete"
step_goal: "Mark story complete and update all tracking"
halts_for_input: true
next_step: "complete"
---

## Goal

Finalize the story and hand off for review.

## Instructions

1. **Update story file:**
   - All tasks checked
   - File List complete
   - Change Log written
   - Dev Agent Record with implementation notes
   - Status → `review`
2. **Update sprint-status.yaml** — story status to `review`.
3. **Present completion summary** to user:
   - Story implemented
   - Files changed
   - Tests added
   - Ready for code review

## User Interaction

"Story **{story-key}** complete and marked for review. Run code review next?"

## Output

Story complete. Workflow complete.

## Navigation

→ Workflow complete. Recommend: code-review skill.
