# Change Workflow: context.md

> Protected change process for the project context document.

---

## Trigger

User requests a change to `docs/context.md` after it has been finalized in Phase 2.

## Steps

### 1. Describe the Change
- What section(s) of context.md need to change?
- Why is this change necessary?
- Is this a correction, addition, or fundamental shift?

### 2. Impact Analysis

context.md changes can affect:

| Downstream Artifact | Check For |
|--------------------|-----------| 
| PRD (`_output/planning/prd.md`) | Problem statement, target audience, scope |
| Architecture (`_output/planning/architecture.md`) | Domain model, system boundaries |
| UX Design Spec | User personas, journey maps |
| Epics & Stories | Acceptance criteria, scope boundaries |

### 3. Downstream Artifact Review
- For each affected artifact, identify the specific sections that need updating
- Estimate effort: minor wording update vs. substantive rework

### 4. Approval
- Present the change and all downstream impacts to the user
- User explicitly approves before proceeding

### 5. Execute Change
- Update context.md with the approved change
- Add version control entry

### 6. Cascade Updates
- Update each affected downstream artifact
- Add version control entries to each

### 7. Log
- Record change in context.md version control panel
- Note: "Change workflow executed" with summary

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-07 | Alfred | Initial context change workflow |
