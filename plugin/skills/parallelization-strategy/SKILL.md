---
name: parallelization-strategy
description: Phase 7 — analyse story dependencies, build DAG, generate PERT chart with critical path and wave grouping, then generate the sprint-status tracking file. PERT chart is sacred-doc per Q3 (downstream contract for Phase 8 wave-orchestration).
license: MIT
compatibility: Invoked by @pm in Phase 7
version: "3.0"
---

## Purpose

Phase 7 — analyse per-story dependencies + integration boundaries (from architecture); build DAG; emit PERT chart sacred-doc; then (Steps 4-6) generate the sprint-status tracking file that downstream Phase 7/8/11 skills read. PERT chart drives Phase 8 wave-orchestration: each wave is a set of independently-executable stories.

**PERT chart is sacred** per Q3 — downstream contract.

Steps 4-6 absorb the former `sprint-planning` skill (WS5-B, §8 item 6): its @scrum-master sub-persona ceremony (Pattern 7 `#8a`/`#8b` transitions) is retired, but the mechanical status-file generation it did is still needed by `create-stories`, `implementation-readiness`, Phase 8 `dev-story`, and Phase 11 `retrospective` — it now runs directly, in @pm's own scope, right after the PERT chart locks.

## When to Use

- Phase 7 — invoked after `create-stories` completes.

## Prerequisites

- All per-story files validated; stories-index complete

## Process

6-step workflow.

→ See [workflow.md](workflow.md).

## Output

`_context/sacred/pert-chart.md` (sacred): DAG + critical path + wave assignments + earliest/latest times per story. `_context/tracking/sprint-status-v{N}.md`: epic/story status tracking, regenerated (never downgraded) each time this skill runs.

## Cross-cutting wire-ins

- `problem_solving` Tier-1 (heavy — first_principles for dependency analysis; scenario_planning for critical-path; failure_mode_analysis)
- `editorial` — Step 4 finalisation

## Method playbook

Per `phase_7:`: problem_solving heavy; brainstorming medium.

## ATTENTION

> Pattern 2 from `docs/prompt-patterns.md` (§6.7) — non-negotiable formatting imperatives for machine-parsed output.

1. Emit the wave groupings as a Markdown table with EXACTLY these columns, in this order: `Wave` / `Epics` / `Dependencies` / `Est. Duration`. Do NOT add columns. Do NOT rename columns.
2. Use numeric wave ids (`1`, `2`, `3`) — NOT `W1` / `Wave 1` / `first`. Downstream consumers (Steps 4-6 of this skill, plus Phase 8 `dev-story`) parse the numeric column directly.
3. Every Epic MUST appear in exactly one wave.
4. Use kebab-case slugs for Epic ids (e.g. `epic-auth-login`).
5. Do NOT prose-describe the groupings between the DAG diagram and the wave table.

## Forcing-function artefacts

> Pattern 3 from `docs/prompt-patterns.md` (§6.7).

### 1. Dependency DAG (MANDATORY)

The output MUST include a `mermaid graph LR` or `graph TD` block showing the epic-level dependency DAG. Copy the scaffold from `templates/prompt-snippets/forcing-function-mermaid.md`.

### 2. Wave Grouping Table (MANDATORY)

As specified in the ATTENTION preamble. Copy the scaffold from `templates/prompt-snippets/forcing-function-table.md`.

### 3. Critical Path Table (MANDATORY)

Columns `Order` / `Epic` / `Start (wave)` / `End (wave)` / `Slack`. Empty Slack cells are a fail — put `0` for critical-path items explicitly.

## Output Contract

> Pattern 5 from `docs/prompt-patterns.md` (§6.7).

Emit exactly one Markdown document with this structure:

1. `# PERT Chart — <project.name>` as the first line.
2. YAML frontmatter: `sacred: true`, `version: "1.0"`, `governance: "requires-review"`, `workflowType: "pert-chart"`, `inputDocuments[]` (MUST include `_context/sacred/architecture.md`), `waves[]`.
3. Sections in order: Overview → DAG (mandatory Mermaid) → Wave Groupings (mandatory table) → Critical Path (mandatory table) → Calendar Projections → Human Gate Points.

Save to `_context/sacred/pert-chart.md`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-07-02 | Butler | Absorbed `sprint-planning` as Steps 4-6 (WS5-B, §8 item 6 — "scrum-master ceremony" retired; mechanical sprint-status generation kept, now direct @pm work). Removed the dead `governance/pert-change/` reference (that governance dir was deleted per §8 item 9; PERT amendments have no dedicated change-workflow currently — flagged for the docs-regen pass, §8.11). |
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #9 Wave 7.4) | Phase 7 rewrite. Inputs converted to graph-first; expanded — now reads breakdown-scope, epics, stories-index, all per-story files, architecture, ADRs (was: minimal). Outputs upgraded — PERT chart sacred-doc + sidecar (per Q3); schema references (`pert-chart.schema.json` + `pert-meta.schema.json`). 4-step workflow. problem_solving Tier-1 heavy wire-ins. |
| 1.1 | 2026-04 (pre-Shape-A) | Cadbury-hq | Earlier refinement |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial parallelization-strategy skill |
