---
name: create-epics
description: Phase 7 — decompose PRD into user-value-grouped epics with epic-to-component mapping. Reads breakdown-scope memo + PRD + architecture + UX-spec + ADRs from graph. Produces validated-distillate epics.
license: MIT
compatibility: Invoked by @pm in Phase 7
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
