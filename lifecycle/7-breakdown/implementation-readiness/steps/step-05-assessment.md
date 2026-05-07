---
step_number: 5
step_name: "Final Assessment"
step_goal: "Issue readiness verdict with recommendations"
halts_for_input: true
next_step: "complete"
---

## Goal

Provide a clear go/no-go decision.

## Instructions

1. **Review all findings** from Steps 1-4.
2. **Issue verdict:**
   - **READY** — All FRs covered, no critical alignment issues, documents complete.
   - **NEEDS WORK** — Minor gaps exist but non-blocking. List specific fixes needed.
   - **NOT READY** — Critical gaps. Must be resolved before proceeding.
3. **List critical issues** requiring immediate action.
4. **Recommend next steps.**
5. **Write report** to output location.
6. **Present to user.**

## User Interaction

"Implementation readiness: **{VERDICT}**. {N} critical issues, {N} warnings. {next steps}"

## Output

Readiness report written. Workflow complete.

## Navigation

→ Workflow complete. If READY → Phase 6: Implementation.
