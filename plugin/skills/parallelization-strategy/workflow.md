---
workflow_version: "2.0"
output_file: "_context/sacred/pert-chart.md"
total_steps: 6
resume_from: "frontmatter"
---

## Overview

Guides dependency analysis and PERT chart generation through: dependency mapping, wave grouping with critical path identification, PERT chart generation with calendar projections, and (Steps 4-6) sprint-status tracking-file generation.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-dependencies.md](steps/step-01-dependencies.md) | Analyze epic/story dependencies, build DAG |
| 2 | [step-02-waves.md](steps/step-02-waves.md) | Topological sort into parallel waves, identify critical path |
| 3 | [step-03-pert.md](steps/step-03-pert.md) | Generate PERT chart with estimates and calendar projections |
| 4 | [step-04-parse-epics.md](steps/step-04-parse-epics.md) | Parse epics and extract all work items |
| 5 | [step-05-detect-statuses.md](steps/step-05-detect-statuses.md) | Detect current statuses from existing files |
| 6 | [step-06-generate-sprint-status.md](steps/step-06-generate-sprint-status.md) | Generate sprint-status.yaml |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- All epic and story dependencies mapped
- DAG is acyclic (no circular dependencies)
- Waves identified with parallel execution groupings
- Critical path identified and highlighted
- PERT chart generated with time estimates and calendar projections
- All epics and stories extracted and sprint-status.yaml generated with valid structure (never downgrading a previously-detected status)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial 3-step PERT-chart workflow. |
| 2.0 | 2026-07-02 | Butler | Absorbed `sprint-planning`'s 3 steps (now 4-6) per §8 item 6 — the @scrum-master ceremony (Pattern 7 sub_phase_boundary transitions #8a/#8b) is retired; the mechanical sprint-status generation stays, run directly by @pm (WS5-B). |
