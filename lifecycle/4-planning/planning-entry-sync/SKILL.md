---
name: "planning-entry-sync"
description: "Phase 4 warm-handoff consolidator — load Phase 2+3 evidence bundle, detect brownfield, select PRD archetype mode, emit planning-scope distillate"
type: "workflow"
category: "lifecycle"
phase: 4
agent: "pm"
always_first: true
inputs:
  graph_queries:
    - "Phase 2+3 full project context summary"
    - "User persona nodes (archetypes, accessibility/device/language targets)"
    - "Idea-validation nodes (North Star, riskiest assumptions, success metrics)"
    - "Product-brief nodes (users, value prop)"
    - "Stack decision nodes + ADR summaries"
    - "Baseline confirmation nodes (Phase 3 stack-locking)"
    - "Phase 3 flagged-risk nodes (from phase-transition)"
  cold_file_reads:
    - "coldpress.yaml"
    - ".coldpress/local-config.yaml"
    - "_context/handoffs/phase-3-to-4-{date}.md"
  existence_checks:
    - "_context/sacred/context.md"
    - "_context/sacred/tech-stack.md"
    - "_context/planning/product-brief-v{N}.md"
    - "_context/planning/personas-v{N}.md"
    - "_context/planning/idea-validation-v{N}.md"
    - "_context/planning/research-synthesis-v{N}.md"
    - "_context/planning/stack-selection-summary-v{N}.md"
    - "_input/legacy/"
outputs:
  - artifact: "Planning Scope Memo"
    location: "_context/planning/planning-scope-v{N}.md"
    format: "markdown"
    schema: "schemas/planning-artefacts/planning-scope.schema.json"
    sacred: false
    versioned: true
    regeneratable: true
version: "1.0"
---

## Purpose

Warm-handoff consolidator at Phase 4 entry — the @pm equivalent of Phase 3's `stack-discovery-sync`. Reads the full Phase 2+3 evidence bundle from the graph, detects the PRD archetype mode, surfaces brownfield signals, and writes a `planning-scope-v{N}.md` distillate that every downstream Phase 4 skill reads instead of re-loading the Phase 2+3 bundle directly.

## When to Use

Always — runs once at Phase 4 entry before any other Phase 4 skill.

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_context/planning/planning-scope-v{N}.md` — validated distillate. Sections: archetype mode, recommended skill sequence, active baselines with architectural constraints, evidence bundle status, flagged risks, `legacy_files_detected` flag.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-25 | Cadbury-hq | Phase II Part 4 Wave 2. New skill — Phase 4 warm-handoff consolidator per deep-dive §5 spec. Graph-first inputs. 5-step workflow: graph-staleness → mode detection → baselines summary → evidence gap detection → scope memo + greeting. |
