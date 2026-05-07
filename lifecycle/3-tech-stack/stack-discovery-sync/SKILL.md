---
name: "stack-discovery-sync"
description: "Consolidate Phase 2 evidence, classify project type and domain complexity, score archetype-keyed pack match, derive tiered candidates per decision-area, and produce a versioned stack shortlist memo."
type: "workflow"
category: "lifecycle"
phase: 3
agent: "architect"
re_runnable: true
inputs:
  - "_context/sacred/context.md"
  - "_context/planning/product-brief-v{N}.md"
  - "_context/planning/idea-validation-v{N}.md"
  - "_context/planning/research/personas-*.md"
  - "_context/planning/research/constraint-*.md"
  - "_context/planning/research-synthesis-v{N}.md"
  - "_context/handoffs/phase-2-to-3-*.md"
  - "_input/vendor/*"
  - "_input/legacy/* (if project_shape: brownfield)"
  - ".coldpress/local-config.yaml"
  - ".coldpress/graph/graph.json"
  - "coldpress.yaml"
  - "data/classification/project-types.csv"
  - "data/classification/domain-complexity.csv"
  - "data/stack-catalog/{area}.yaml (10 files)"
  - "skills/stack-packs/*/pack.yaml (runtime discovery)"
outputs:
  - artifact: "Stack Shortlist"
    location: "_context/planning/stack-shortlist-v{N}.md"
    format: "markdown"
    versioned: true
    schema: "schemas/planning-artefacts/stack-shortlist.schema.json"
version: "1.0"
status: "wire-in-phase-3"
---

## Purpose

Warm-starts Phase 3 by consolidating all Phase 2 evidence into a single stack-shortlist memo. Evidence is the primary input — candidates are *derived* from personas, constraints, idea-validation assumptions, and vendor docs, not named ad-hoc. The skill classifies the project (type + domain complexity), scores available starter packs for archetype fit, and produces a tiered candidate list per decision-area using a three-tier ordering:

- **Tier 1 (T1):** Pack pre-picks (when a pack scores ≥ 0.7 match and user confirms)
- **Tier 2 (T2):** Pre-loaded catalog candidates (`data/stack-catalog/{area}.yaml`)
- **Tier 3 (T3):** Graph-query + web-search fallback for uncatalogued areas or user-rejected T2

`re_runnable: true` — user may drop more `_input/vendor/` docs mid-Phase-3 and re-run; produces `stack-shortlist-v{N+1}`.

## When to Use

- "start Phase 3"
- "let's pick the tech stack"
- "sync what we know about the stack so far"
- "I added new vendor docs — re-run discovery"
- First skill invoked at Phase 3 entry (after Step 0 entry-check passes)

## Prerequisites

- `phase_2_completed: true` in `.coldpress/local-config.yaml`
- `_context/sacred/context.md` exists and is locked (sacred)
- `_context/planning/product-brief-v{N}.md` authored
- `_context/handoffs/phase-2-to-3-*.md` present

## Tier 1 Core Methods

- **Step 2 (classify):** First Principles Thinking (T0) + Jobs to be Done (T0) — cited from `docs/method-catalog-meta.md`
- **Step 3 (derive candidates):** Morphological Analysis + Pareto Analysis — cited from `data/methods/problem-solving-methods.csv`

## Process

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/planning/stack-shortlist-v{N}.md` with three sections:
- **Section A:** Pack-match verdict (proposed pack + coverage + user-confirm state OR "no-match → independent recommended")
- **Section B:** Per-area tiered candidates (tier taken + candidate list + evidence-bound rationale)
- **Section C:** Baselines applicability (per-category: covered by pack? / needs env-provision actions? / any candidate at any tier that would fail a baseline?)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial stack-discovery-sync skill — Phase II Part 3 Wave 2. |
