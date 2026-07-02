---
step_number: 1
step_name: "Select Story"
step_goal: "Determine target story from sprint-status or user input"
halts_for_input: true
next_step: "step-02-analyze.md"
---

## Goal

Identify which story to build a context file for.

## Instructions

1. **Check for `_context/tracking/sprint-status.yaml`.** If it exists, load it and identify stories with status `backlog` or `ready-for-dev` that lack context files.
2. **If sprint-status exists**, present available stories to the user and ask which one to work on.
3. **If sprint-status does not exist**, ask the user to specify a story key (e.g., E1-S1) or run `parallelization-strategy` first (its Steps 4-6 generate sprint-status).
4. **Load `_context/planning/epics.md`** and extract the target story's details: description, acceptance criteria, epic context.
5. **Confirm selection** with the user before proceeding.

## Output

Target story identified and confirmed. `step_1_complete: true`

## Navigation

-> Proceed to [step-02-analyze.md](step-02-analyze.md)
