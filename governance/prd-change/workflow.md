# Change Workflow: PRD

> Protected change process for the Product Requirements Document.

---

## Trigger

User requests a change to `_context/planning/prd.md` after it has been created and validated in Phase 4.

## Steps

### 1. Describe the Change
- What requirement is being added, removed, or modified?
- Why? (User feedback, technical constraint, scope change, market shift)
- Is this a scope expansion, reduction, or lateral change?

### 2. Impact Analysis

PRD changes can affect:

| Downstream Artifact | Check For |
|--------------------|-----------|
| Architecture (`_context/planning/architecture.md`) | System design, component boundaries, data model |
| UX Design Spec | User flows, wireframes, interaction patterns |
| Epics | Epic scope, new epics needed, epics to remove |
| Stories | Story acceptance criteria, new stories, obsolete stories |
| PERT chart | Timeline, dependencies, critical path |

### 3. Downstream Artifact Review
- For each affected artifact, identify specific sections that need updating
- Flag if the change adds/removes an entire epic

### 4. Approval
- Present the change and all downstream impacts
- User explicitly approves

### 5. Execute Change
- Update the PRD
- Add version control entry

### 6. Cascade Updates
- Update architecture if system design is affected
- Update UX spec if user flows change
- Update epics and stories as needed
- Re-run PERT if dependencies or scope changed

### 7. Log
- Record change in PRD version control panel

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-07 | Alfred | Initial PRD change workflow |
