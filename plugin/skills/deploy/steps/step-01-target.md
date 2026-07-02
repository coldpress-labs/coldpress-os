---
step_number: 1
step_name: "Select Target"
step_goal: "Determine deployment target environment"
halts_for_input: true
next_step: "step-02-execute.md"
---

## Instructions

1. **Read tech-stack.md** for deployment platform (Vercel, Docker, Fly.io, etc.).
2. **Ask user:** Staging or production?
3. **Confirm deployment target** before executing.

## Output

Target confirmed. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-execute.md](step-02-execute.md)
