---
name: "parallelization-strategy"
description: "Phase 7 — analyse story dependencies, build DAG, generate PERT chart with critical path and wave grouping. PERT chart is sacred-doc per Q3 (downstream contract for Phase 8 wave-orchestration)."
type: "workflow"
category: "lifecycle"
phase: 7
agent: "pm"
inputs:
  graph_queries:
    - "breakdown-scope-v{latest}"
    - "epics-v{latest}"
    - "stories-index"
    - "architecture-md"
    - "adrs"
  cold_file_reads:
    - "_context/implementation/stories-index.md"
    - "_context/implementation/stories/story-NNN-*-v{N}.md (all)"
    - "_context/sacred/architecture.md"
  existence_checks:
    - "stories-index exists"
    - "stories validated (all per-story files validate against story.schema.json)"
    - "architecture-md.locked == true"
outputs:
  - artifact: "PERT Chart (SACRED per Q3)"
    location: "_context/sacred/pert-chart.md"
    format: "markdown (sacred)"
    sacred: true
    schema: "schemas/sacred-docs/pert-chart.schema.json"
  - artifact: "PERT meta sidecar"
    location: "_context/sacred/pert-chart.meta.json"
    format: "json"
    schema: "schemas/handoffs/pert-meta.schema.json"
version: "2.0"
---

## Purpose

Phase 7 — analyse per-story dependencies + integration boundaries (from architecture); build DAG; emit PERT chart sacred-doc. PERT chart drives Phase 8 wave-orchestration: each wave is a set of independently-executable stories.

**PERT chart is sacred** per Q3 — downstream contract; amendments via `governance/pert-change/` workflow.

## When to Use

- Phase 7 — invoked after `create-stories` completes.

## Prerequisites

- All per-story files validated; stories-index complete

## Process

4-step workflow.

→ See [workflow.md](workflow.md).

## Output

`_context/sacred/pert-chart.md` (sacred): DAG + critical path + wave assignments + earliest/latest times per story.

## Cross-cutting wire-ins

- `problem_solving` Tier-1 (heavy — first_principles for dependency analysis; scenario_planning for critical-path; failure_mode_analysis)
- `editorial-structure` — Step 4 finalisation

## Method playbook

Per `phase_7:`: problem_solving heavy; brainstorming medium.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #9 Wave 7.4) | Phase 7 rewrite. Inputs converted to graph-first; expanded — now reads breakdown-scope, epics, stories-index, all per-story files, architecture, ADRs (was: minimal). Outputs upgraded — PERT chart sacred-doc + sidecar (per Q3); schema references (`pert-chart.schema.json` + `pert-meta.schema.json`). 4-step workflow. problem_solving Tier-1 heavy wire-ins. |
| 1.1 | 2026-04 (pre-Shape-A) | Cadbury-hq | Earlier refinement |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial parallelization-strategy skill |
