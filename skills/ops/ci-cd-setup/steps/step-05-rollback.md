---
step_number: 5
step_name: "Rollback Procedure"
step_goal: "Generate rollback documentation for deployment failures"
halts_for_input: false
next_step: "step-06-validate.md"
---

## Goal

Create a rollback procedure document that the team can follow when a deployment goes wrong.

## Instructions

1. **Generate `docs/rollback.md`** covering:
   - How to identify a failed deployment
   - Platform-specific rollback steps (Vercel revert, Docker image rollback, git revert)
   - Database rollback considerations
   - Communication checklist (who to notify)
   - Post-rollback verification steps

2. **Tailor to detected stack and platform.**

## Output

Rollback procedure document. Update frontmatter: `step_5_complete: true`

## Navigation

→ Auto-proceed to [step-06-validate.md](step-06-validate.md)
