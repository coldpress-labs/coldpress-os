# Change Workflow: tech-stack.md

> Protected change process for the technology stack document.

---

## Trigger

User requests a change to `_context/sacred/tech-stack.md` after it has been locked in Phase 3.

## Severity Levels

| Level | Examples | Required Process |
|-------|----------|-----------------|
| **Minor** | Version bump, config tweak | Steps 1, 4, 5, 7 |
| **Moderate** | Add a new dependency, swap a utility lib | Full workflow |
| **Major** | Change framework, database, or hosting | Full workflow + architecture re-review |

## Steps

### 1. Describe the Change
- What technology is being added, removed, or swapped?
- Why? (Performance, cost, compatibility, feature need)
- What severity level?

### 2. Impact Analysis

tech-stack.md changes can affect:

| Downstream Artifact | Check For |
|--------------------|-----------| 
| Architecture (`_context/sacred/architecture.md`) | System design, integration patterns, infrastructure |
| Implementation code | Import paths, API usage, patterns |
| CI/CD config | Build steps, test runners, deploy targets |
| Deployment config | Hosting, environment variables, runtime |
| Stack pack selection | May need to swap `coldpress.yaml` stack_pack |

### 3. Downstream Artifact Review
- For each affected artifact, identify specific impacts
- For **major** changes: flag if architecture needs re-review by @architect

### 4. Approval
- Present the change, severity, and all downstream impacts
- User explicitly approves

### 5. Execute Change
- Update tech-stack.md
- Add version control entry

### 6. Cascade Updates
- Update architecture if affected
- Update implementation patterns if affected
- Update CI/CD if affected
- Update `coldpress.yaml` stack_pack if changing stack

### 7. Log
- Record change in tech-stack.md version control panel

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-07 | Alfred | Initial tech-stack change workflow |
