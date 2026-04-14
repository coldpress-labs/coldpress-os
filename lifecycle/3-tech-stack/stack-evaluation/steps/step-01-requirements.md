---
step_number: 1
step_name: "Gather Requirements"
step_goal: "Extract technology requirements and constraints from context.md"
halts_for_input: true
next_step: "step-02-evaluate.md"
---

## Goal

Understand what the project needs from a technology perspective before evaluating options.

## Instructions

1. **Read** `docs/context.md` to understand the project vision, scope, and constraints.
2. **Ask:** "What technology decision are we evaluating?" (e.g., frontend framework, database, hosting)
3. **Extract requirements** relevant to this decision:
   - Performance needs
   - Scale expectations
   - Budget constraints (free tier? paid?)
   - Team experience / vibe-coder friendliness
   - Integration requirements with other stack components
4. **Confirm requirements** with the user before proceeding.
5. **Initialize output document** with decision metadata and requirements.

## Output

Decision area scoped, requirements documented. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-evaluate.md](step-02-evaluate.md)
