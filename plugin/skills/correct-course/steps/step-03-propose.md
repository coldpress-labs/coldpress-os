---
step_number: 3
step_name: "Change Proposal"
step_goal: "Generate Sprint Change Proposal with specific recommendations"
halts_for_input: true
next_step: "complete"
---

## Instructions

1. **Draft specific changes** with before/after format:
   - Story ID and section being modified
   - Old text → New text
   - Rationale for each change

2. **Structure proposal:**
   - Issue Summary
   - Impact Analysis
   - Recommended Approach (direct adjustment, rollback, MVP review)
   - Detailed Change Proposals
   - Implementation Handoff (minor → dev team, moderate → coordination, major → replan)

3. **Present to user** for approval.
4. **Write proposal** to output location.
5. **If approved,** guide handoff to appropriate workflow:
   - Minor → dev-story can proceed
   - Moderate → update epics, then continue
   - Major → loop back to Phase 4 planning

## Output

Sprint Change Proposal written. Workflow complete.

## Navigation

→ Workflow complete. Route based on scope.
