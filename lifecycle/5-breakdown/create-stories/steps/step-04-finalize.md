---
step_number: 4
step_name: "Finalize"
step_goal: "Write story file and update sprint-status to ready-for-dev"
halts_for_input: true
next_step: null
---

## Goal

Write the comprehensive story context file and update tracking.

## Instructions

1. **Assemble the story file** at `_output/implementation/{story-key}.md` with sections:
   - Story metadata (key, epic, title, complexity)
   - Acceptance criteria (Given/When/Then from epics)
   - Technical requirements
   - File structure and changes
   - Library specifics and usage patterns
   - Testing requirements
   - Anti-patterns and guardrails
   - Dependencies and scope boundaries
2. **Present the story file** to the user for review.
3. **Write the file** after user approval.
4. **Update `_output/tracking/sprint-status.yaml`** -- set this story's status to `ready-for-dev`.
5. **Report completion** and suggest next actions (create context for next story, or begin implementation).

## Output

`_output/implementation/{story-key}.md` written. Sprint status updated. `step_4_complete: true`

## Navigation

Workflow complete. Run again for the next story, or proceed to implementation.
