---
name: "parallelization-strategy"
description: "Analyze epic dependencies, build DAG, generate PERT chart with critical path and wave grouping"
type: "workflow"
category: "lifecycle"
phase: 5
agent: "scrum-master"
inputs:
  - "_context/planning/epics.md"
  - "_context/sacred/architecture.md"
outputs:
  - artifact: "PERT chart"
    location: "_context/sacred/pert-chart.md"
    format: "markdown"
    sacred: true
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

## ATTENTION

> Pattern 2 from `docs/prompt-patterns.md` — non-negotiable formatting imperatives for machine-parsed output.

1. Emit the wave groupings as a Markdown table with EXACTLY these columns, in this order: `Wave` / `Epics` / `Dependencies` / `Est. Duration`. Do NOT add columns. Do NOT rename columns.
2. Use numeric wave ids (`1`, `2`, `3`) — NOT `W1` / `Wave 1` / `first`. Downstream sprint-planning consumers parse the numeric column directly.
3. Every Epic MUST appear in exactly one wave. Double-assignment breaks the wave-orchestration consumer; a missing Epic fails the phase-5 gate.
4. Use kebab-case slugs for Epic ids in the `Epics` column (e.g. `epic-auth-login`) — NOT Title Case or prose references. Slugs must match `epics.md`'s ids verbatim.
5. Do NOT prose-describe the groupings between the DAG diagram and the wave table. The DAG + table ARE the artefact; a summary paragraph is a fail.

## Forcing-function artefacts

> Pattern 3 from `docs/prompt-patterns.md`.

### 1. Dependency DAG (MANDATORY)

The output MUST include a `mermaid graph LR` or `graph TD` block showing the epic-level dependency DAG. Nodes are Epic slugs; edges are `depends_on` relations. A text-only description of dependencies is INSUFFICIENT. Copy the scaffold from `templates/prompt-snippets/forcing-function-mermaid.md`.

### 2. Wave Grouping Table (MANDATORY)

As specified in the ATTENTION preamble above. Copy the scaffold from `templates/prompt-snippets/forcing-function-table.md` and rename columns per the preamble's rule #1.

### 3. Critical Path Table (MANDATORY)

A second table listing the critical-path Epics in execution order, with columns `Order` / `Epic` / `Start (wave)` / `End (wave)` / `Slack` (for non-critical epics, slack = free days; for critical path, slack = 0). Empty cells in the Slack column are a fail — put `0` for critical-path items explicitly.

## Output Contract

> Pattern 5 from `docs/prompt-patterns.md`.

You must emit exactly one Markdown document with this structure:

1. `# PERT Chart — <project.name>` as the first line.
2. YAML frontmatter: `sacred: true`, `version: "1.0"`, `governance: "requires-review"`, `workflowType: "pert-chart"`, `inputDocuments[]` (MUST include `_context/sacred/architecture.md` per the `pert_references_architecture` Rego policy in Block Y), `waves[]` (array of `{id: "wave-N", name: "<label>"}` per the pert-chart JSON schema).
3. Sections in order: Overview → DAG (mandatory Mermaid) → Wave Groupings (mandatory table with exact columns) → Critical Path (mandatory table) → Calendar Projections → Human Gate Points.
4. Each section opens with the italicised meta-description (Pattern 1).
5. No additional top-level sections. No trailing "Notes" / "Summary" / "Closing Thoughts".

Save to `_context/sacred/pert-chart.md`. Confirm the save in the chat with: file path + line count + number of waves + critical-path length.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial parallelization-strategy skill for Phase 5 |
| 1.1 | 2026-04-24 | Cadbury-hq | Added ATTENTION preamble (Pattern 2), Forcing-function artefacts (Pattern 3 — mandatory DAG + wave table + critical-path table), Output Contract (Pattern 5) per §6.7 Block II. |
