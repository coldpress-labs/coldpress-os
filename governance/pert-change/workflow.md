# Change Workflow: PERT Chart

> Protected change process for the project PERT chart / parallelization strategy.

---

## Trigger

User requests a change to `_output/tracking/pert-chart.md` after it has been generated in Phase 5.

## Steps

### 1. Describe the Change
- What dependency, wave grouping, or timeline is changing?
- Why? (New epic, removed epic, dependency discovered, resource change)

### 2. Impact Analysis

PERT chart changes can affect:

| Downstream Artifact | Check For |
|--------------------|-----------|
| Sprint planning | Sprint scope, story sequencing |
| Wave execution | Wave composition, gate points |
| Timeline estimates | Critical path, parallel vs. sequential time |

### 3. Downstream Artifact Review
- Recalculate critical path if dependencies changed
- Re-evaluate wave groupings via topological sort
- Update calendar estimates

### 4. Approval
- Present the updated PERT and its impact on timelines
- User explicitly approves

### 5. Execute Change
- Regenerate or update the PERT chart
- Add version control entry

### 6. Cascade Updates
- Update sprint plan if active
- Notify of any wave composition changes

### 7. Log
- Record change in PERT chart version control panel

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-07 | Alfred | Initial PERT change workflow |
