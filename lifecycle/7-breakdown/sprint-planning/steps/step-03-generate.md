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

## Pattern 7 transition (sub_phase_boundary return)

After user-confirmed write, append the `#8b` transition record to the Pattern 7 buffer at `_context/handoffs/pattern-7-transitions-wip-{date}.yaml`:

```yaml
- trigger: sub_phase_boundary
  from_agent: scrum-master
  to_agent: pm
  rationale: "Sprint plan complete; returning to @pm for implementation-readiness"
  warm_handoff: null
  resumes_to: null
  recorded_at: <ISO>
```

This pairs with `#8a` written at step-01 entry. Both records flush to the handoff log at Phase 7 exit (via `phase-transition/steps/step-03-handoff-log.md` Step 2a).

## Navigation

→ Workflow complete.
