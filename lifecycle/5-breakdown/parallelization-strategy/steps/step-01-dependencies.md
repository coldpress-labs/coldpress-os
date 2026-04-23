---
step_number: 1
step_name: "Dependencies"
step_goal: "Analyze epic and story dependencies, build DAG"
halts_for_input: true
next_step: "step-02-waves.md"
---

## Goal

Map all dependencies between epics and stories into a directed acyclic graph.

## Instructions

1. **Load `_context/planning/epics.md`.** Extract all epics and stories.
2. **For each epic**, determine:
   - Which epics must be completed before this one can start (hard dependencies)
   - Which epics would benefit from being done first (soft dependencies)
   - Which epics are completely independent
3. **For each story within an epic**, determine:
   - Intra-epic dependencies (stories that must be done first within the same epic)
   - Cross-epic dependencies (stories from other epics that are prerequisites)
4. **Build the DAG.** Represent as an adjacency list.
5. **Validate acyclicity.** If cycles are detected, present them to the user for resolution.
6. **Present the dependency map** to the user for validation.

## Output

Dependency DAG built and validated as acyclic. `step_1_complete: true`

## Navigation

-> Proceed to [step-02-waves.md](step-02-waves.md)
