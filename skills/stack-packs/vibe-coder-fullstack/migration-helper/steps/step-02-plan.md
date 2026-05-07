---
step_number: 2
step_name: "Migration Strategy"
step_goal: "Create a safe migration plan"
halts_for_input: true
next_step: "step-03-execute.md"
---

## Goal

Design the safest path from current to desired schema.

## Instructions

1. **For additive changes:** Apply directly — no migration needed.
2. **For modifications:** Plan multi-step approach:
   - Add new field (optional)
   - Backfill existing documents
   - Update functions to use new field
   - Remove old field (if applicable)
3. **For destructive changes:** Create backfill/migration functions.
4. **Present migration plan** with steps and risks.

## Output

Migration plan documented. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-execute.md](step-03-execute.md)
