---
step_number: 6
step_name: "Generate Sprint Status"
step_goal: "Write sprint-status.yaml with all work items and statuses"
halts_for_input: true
next_step: null
---

## Goal

Produce the sprint tracking file. This is the artefact Phase 7's own exit gate (`sprint-status-validated`), `create-stories`, `implementation-readiness`, Phase 8 `dev-story`, and Phase 11 `retrospective` all read.

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

`_context/tracking/sprint-status-v{N}.md` (sprint-status.yaml embedded/referenced per the existing artefact convention) written. Workflow complete.

## Navigation

→ Workflow complete. Proceed to `implementation-readiness`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Original `sprint-planning` Step 3. |
| 2.0 | 2026-07-02 | Butler | Folded into `parallelization-strategy` as Step 6 (WS5-B, §8 item 6). Dropped the Pattern 7 `#8b` sub_phase_boundary return transition — no agent hand-off occurs now, so there is nothing to return from. |
