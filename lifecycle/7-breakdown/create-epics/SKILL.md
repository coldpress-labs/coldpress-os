---
name: "create-epics"
description: "Phase 7 — decompose PRD into user-value-grouped epics with epic-to-component mapping. Reads breakdown-scope memo + PRD + architecture + UX-spec + ADRs from graph. Produces validated-distillate epics."
type: "workflow"
category: "lifecycle"
phase: 7
agent: "pm"
inputs:
  graph_queries:
    - "breakdown-scope-v{latest}"
    - "prd-v{latest}"
    - "architecture-md"
    - "ux-design-spec-v{latest}"
    - "personas-v{latest}"
    - "idea-validation-v{latest}"
    - "adrs"
    - "archetype-mode"
    - "legacy-migration-plan-v{latest}"
  cold_file_reads:
    - "_context/planning/breakdown-scope-v{latest}.md"
    - "_context/sacred/prd.md"
    - "_context/sacred/architecture.md"
  existence_checks:
    - "breakdown-scope-v{latest} exists"
    - "prd-v{latest}.locked == true"
    - "architecture-md.locked == true"
outputs:
  - artifact: "Epics"
    location: "_context/planning/epics-v{N}.md"
    format: "markdown"
    sacred: false
    distillate: true
    schema: "schemas/planning-artefacts/epic.schema.json"
  - artifact: "Epics sidecar"
    location: "_context/planning/epics-v{N}.meta.json"
    format: "json"
version: "2.0"
---

## Purpose

Phase 7 — break PRD into user-value-grouped epics. Each epic links to PRD user-stories + architecture components + UX flows.

Under Shape A: reads `breakdown-scope-v{N}.md` (from `breakdown-entry-sync`) for archetype mode + open issues + flagged-deltas-status. PRD assumed possibly v(N+1) (post-Phase-7-architecture-deltas-reconciliation if any).

## When to Use

- "create epics"
- Phase 7 — invoked after `breakdown-entry-sync` completes.

## Prerequisites

- `breakdown-scope-v{latest}.md` exists
- PRD locked + architecture sacred + locked

## Process

5-step workflow (Step 0 NEW graph-first; Steps 1-4 substantive).

→ See [workflow.md](workflow.md).

## Output

`_context/planning/epics-v{N}.md` — validated-distillate. User-value-grouped epics with PRD user-story + architecture-component + UX-flow mappings.

## Cross-cutting wire-ins

- `editorial-structure` — Step 4 finalisation
- `brainstorming` — Step 2 epic decomposition (round_robin, mind_mapping)
- `design_thinking` — Step 2 (define stage)

## Method playbook

Per `phase_7:`: brainstorming medium; design_thinking low (define).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-30 | Butler (autonomous queue unit #9 Wave 7.3) | Phase 7 rewrite. Inputs converted to graph-first (graph_queries + cold_file_reads + existence_checks per deep-dive §7b). Inputs expanded — now reads breakdown-scope, UX-spec, ADRs, prototype-manifest, personas, idea-validation, legacy-migration-plan (was: only PRD + architecture). Outputs upgraded to validated-distillate with schema. Step 0 NEW (graph-first). Cross-cutting wire-ins documented (brainstorming + design_thinking + editorial-structure). |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial create-epics skill |
