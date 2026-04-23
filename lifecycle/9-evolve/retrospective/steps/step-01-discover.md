---
step_number: 1
step_name: "Epic Discovery"
step_goal: "Find the completed epic and load all relevant context"
halts_for_input: true
next_step: "step-02-reflect.md"
---

## Instructions

1. **Check sprint-status.yaml** for the highest completed epic without a retrospective.
2. **Load epic details** — stories, acceptance criteria, completion dates.
3. **Load previous retrospective** (if exists) for continuity.
4. **Load architecture, PRD** for reference.
5. **Present epic summary** to user.

## Output

Epic context loaded. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-reflect.md](step-02-reflect.md)
