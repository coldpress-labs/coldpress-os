# Change Workflow: architecture.md

> Protected change process for the architecture/solution design document.

---

## Trigger

User requests a change to `_context/sacred/architecture.md` after it has been created in Phase 4.

## Steps

### 1. Describe the Change
- What architectural decision is changing?
- Why? (Technical discovery, performance issue, constraint change)
- Does this change the tech stack? (If yes, run tech-stack change workflow first)

### 2. Impact Analysis

Architecture changes can affect:

| Downstream Artifact | Check For |
|--------------------|-----------|
| Epics | Implementation approach, epic scope |
| Stories | Technical tasks, acceptance criteria |
| PERT chart | Dependencies, parallelization strategy |
| Implementation code | Patterns, integrations, data model |

### 3. Downstream Artifact Review
- For each affected artifact, identify specific impacts
- Flag stories that may need rewriting vs. minor updates

### 4. Approval
- Present the change and all downstream impacts
- User explicitly approves

### 5. Execute Change
- Update architecture.md
- Create ADR (Architecture Decision Record) if this reverses a prior decision
- Add version control entry

### 6. Cascade Updates
- Update affected epics and stories
- Re-evaluate PERT if dependencies change
- Update implementation patterns in active code if mid-sprint

### 7. Log
- Record change in architecture.md version control panel

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-07 | Alfred | Initial architecture change workflow |
