---
workflow_version: "1.0"
output_file: "_context/tracking/pert-chart.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Guides dependency analysis and PERT chart generation through: dependency mapping, wave grouping with critical path identification, and PERT chart generation with calendar projections.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-dependencies.md](steps/step-01-dependencies.md) | Analyze epic/story dependencies, build DAG |
| 2 | [step-02-waves.md](steps/step-02-waves.md) | Topological sort into parallel waves, identify critical path |
| 3 | [step-03-pert.md](steps/step-03-pert.md) | Generate PERT chart with estimates and calendar projections |

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
