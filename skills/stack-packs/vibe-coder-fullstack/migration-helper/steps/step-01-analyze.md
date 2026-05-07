---
step_number: 1
step_name: "Analyze Changes"
step_goal: "Understand current schema and desired changes"
halts_for_input: true
next_step: "step-02-plan.md"
---

## Goal

Map the difference between current and desired schema states.

## Instructions

1. **Read current `convex/schema.ts`.**
2. **Gather desired changes** from user.
3. **Classify each change:**
   - **Safe (additive):** New table, new optional field, new index
   - **Careful (modify):** Field type change, making optional field required
   - **Dangerous (destructive):** Removing field, removing table, removing index
4. **Present analysis** with risk level for each change.

## Output

Change analysis documented. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-plan.md](step-02-plan.md)
