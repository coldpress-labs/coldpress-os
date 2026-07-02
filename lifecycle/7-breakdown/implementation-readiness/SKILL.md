---
name: "implementation-readiness"
description: "Phase 7 final gate — 9-point structured checklist verifying every entry condition for Phase 8 (per Q6). Pre-Phase-8 readiness gate."
type: "workflow"
category: "lifecycle"
phase: 7
agent: "pm"
inputs:
  graph_queries:
    - "breakdown-scope-v{latest}"
    - "prd-v{latest}"
    - "ux-design-spec-v{latest}"
    - "architecture-md"
    - "adrs"
    - "epics-v{latest}"
    - "stories-index"
    - "pert-chart"
    - "sprint-status-v{latest}"
    - "prototype-manifest"
    - "legacy-migration-plan-v{latest}"
    - "legacy-ui-assessment-v{latest}"
    - "phase-5-to-6 handoff"
    - "phase-6-to-7 handoff"
  cold_file_reads:
    - "all per-story files (validation traversal)"
  existence_checks:
    - "sprint-status-v{latest} exists"
    - "pert-chart sacred + locked"
outputs:
  - artifact: "Implementation Readiness Report"
    location: "_context/audit/implementation-readiness-v{N}.md"
    format: "markdown"
    sacred: false
    distillate: true
    schema: "schemas/planning-artefacts/implementation-readiness.schema.json"
version: "2.0"
---

## Purpose

Phase 7 final step — 9-point structured checklist per Q6 verifying Phase 8 entry conditions. Pre-Phase-8 readiness gate. Pre-Shape A this skill produced free-form prose; under Shape A it produces a structured checklist with per-check pass/fail/warn + evidence.

## When to Use

- Phase 7 — invoked LAST, after `parallelization-strategy` (which now includes sprint-status generation, WS5-B) completes.

## Prerequisites

- All upstream Phase 7 skills complete
- sprint-status validated; PERT chart sacred + locked

## Process

2-step workflow (graph-first + 9-point check + emit).

→ See [workflow.md](workflow.md).

## 9-Point Checklist (per Q6)

| # | Check | Pass criterion |
|---|-------|---------------|
| 1 | PRD user-story coverage | Every PRD US-id referenced in ≥1 story |
| 2 | UX screen coverage | Every ux-design-spec screen referenced in ≥1 story (front-end) |
| 3 | Architecture component coverage | Every architecture component referenced in ≥1 story |
| 4 | Flagged-deltas resolved at Phase 6 | Every Phase-5 flag_for_architecture_ADR delta has corresponding Phase-6 ADR (re-verify silent-divergence guard) |
| 5 | PERT valid | PERT chart sacred-doc valid; no cycles; critical path identified |
| 6 | Sprint complete | Every story assigned to a wave in sprint-status |
| 7 | No ADR contradictions | Auto-detect: no two ADRs with contradicting decisions |
| 8 | Prototype available | prototype-manifest exists (required for code-skeleton-mode reference in Phase 8) |
| 9 | Legacy decisions reflected | (Brownfield only) Every legacy-migration-plan + legacy-ui-assessment decision reflected in story disposition |

Greenfield projects skip check #9 (mark as N/A).

## Output

`_context/audit/implementation-readiness-v{N}.md` — structured report with per-check pass/fail/warn + evidence (file paths, counts, gaps).

If any block-severity check fails: Phase 7 cannot exit. Loop back to upstream skill to address.

## Cross-cutting wire-ins

- `problem_solving` (failure_mode_analysis at check #7 ADR contradiction detection)
- `editorial-structure` — Step 1 final report polish

## Method playbook

Per `phase_7:`: problem_solving heavy.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #9 Wave 7.5) | Phase 7 rewrite. Per Q6 — 9-point structured checklist (was: free-form prose). Inputs converted to graph-first; reads ALL upstream artefacts for end-to-end coverage verification. Outputs structured report with per-check pass/fail/warn. Schema reference. Greenfield/brownfield branching at check #9. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial implementation-readiness skill |
