---
name: parallelization-strategy
description: Analyze epic dependencies, build DAG, generate PERT chart with critical path and wave grouping
license: MIT
compatibility: Invoked by @scrum-master in Phase 5
version: "1.0"
---

## Purpose

Analyzes dependencies between epics and stories, builds a directed acyclic graph (DAG), performs topological sorting into parallel execution waves, identifies the critical path, and generates a PERT chart with calendar-based time estimates. The PERT chart is a **sacred document** -- it represents the authoritative execution plan.

## When to Use

- "analyze dependencies between epics"
- "create a PERT chart"
- "identify the critical path"
- "what can be parallelized?"
- "build an execution timeline"
- After epics and stories are created, before sprint planning

## Prerequisites

- `_context/planning/epics.md` exists (from create-epics)
- `_context/sacred/architecture.md` exists for dependency inference

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_context/sacred/pert-chart.md` (sacred) -- dependency DAG, wave groupings, critical path, and calendar projections with human gate points.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial parallelization-strategy skill for Phase 5 |
