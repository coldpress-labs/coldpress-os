---
step_number: 3
step_name: "Generate Status File"
step_goal: "Write sprint-status.yaml with all work items and statuses"
halts_for_input: true
next_step: "complete"
---

## Goal

Produce the sprint tracking file.

## Instructions

1. **Generate sprint-status.yaml** with structure:
   - `metadata:` generated date, project name, project key, story location
   - `status_definitions:` epic/story/retrospective status flows
   - `development_status:` map of all items with current status

2. **Validate** all stories are accounted for, no duplicates, statuses are valid.

3. **Report summary:** Total epics, stories, status distribution.

4. **Present to user** for confirmation.

## User Interaction

"Sprint tracking generated: **{N}** epics, **{N}** stories. Status breakdown: {distribution}. Write to sprint-status.yaml?"

## Output

sprint-status.yaml written. Workflow complete.

## Navigation

→ Workflow complete.
