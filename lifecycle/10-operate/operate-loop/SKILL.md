---
name: "operate-loop"
description: "Phase 10 entry skill (per Q1) + iterative operate orchestrator. Step 0 absorbs entry-sync (graph-first context + 9th-consumer staleness + ops-deltas WIP log init). Produces the versioned sprint-status tracking artefact per iteration (v{N}, v{N+1}, ...) per user-defined cadence."
type: "workflow"
category: "lifecycle"
phase: 10
agent: "devops"
inputs:
  graph_queries:
    - "deploy-log-v{latest}"
    - "readiness-v{latest}"
    - "wave-status-v{latest}"
    - "architecture-md"
    - "coldpress-yaml-baselines"
    - "live-telemetry"
  cold_file_reads:
    - "_context/handoffs/phase-9-to-10-{date}.md"
    - "_context/tracking/deploy-log-v{latest}.md"
  existence_checks:
    - "deploy-log-v{latest} status: success"
    - "phase-9-to-10 handoff exists"
outputs:
  - artifact: "Sprint Status (versioned per iteration)"
    location: "_context/tracking/sprint-status-v{N}.md"
    format: "markdown"
    sacred: false
    distillate: true
version: "2.0"
---

## Purpose

Phase 10 entry skill + iterative orchestrator. Step 0 absorbs entry-sync work. Subsequent steps drive iterative sprint-status updates per user-defined cadence (Phase 10 is continuous-by-default; runs until user invokes Phase 11 retrospective).

ops-deltas surfaced during operations are appended to `_context/handoffs/phase-10-ops-deltas-wip-{date}.md` (initialised at Step 0). Aggregated by phase-transition step-02a-reconciliation at user-invoked Phase 11 transition.

## When to Use

- Phase 10 entry — invoked after `phase-transition` writes phase-9-to-10 handoff.
- Re-runnable per iteration cadence.

## Prerequisites

- Phase 9 exit clean (post-deploy gate passed)
- System running

## Output

`_context/tracking/sprint-status-v{N}.md` — validated-distillate per iteration. Each version captures: ongoing wave-status / open incidents / closed incidents / ops-deltas surfaced / next-iteration goals.

## ops-deltas WIP log

Step 0 initialises `_context/handoffs/phase-10-ops-deltas-wip-{date}.md`. correct-course / operate-loop / document-project append `ops_delta` entries during execution. Aggregated by phase-transition at user-invoked Phase 11 transition.

## Cross-cutting wire-ins

- `editorial` — sprint-status report polish

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-07-02 | Butler (v0.4 WS5, D16) | Renamed skill `sprint-status` → `operate-loop` (dir + frontmatter `name`). §8 item 6 had grouped `sprint-status` with `sprint-planning` as "scrum ceremony" to DELETE, but this skill is Phase 10's structural entry + iterative operate orchestrator (initialises the ops-deltas WIP log that `phase-transition` step-02a reads; drives the operate loop to Phase 11) — deleting it would break Phase 10 entry. Per user decision (2026-07-02) the fix is a rename-away-from-scrum-framing that preserves function, not a delete. The versioned tracking **artefact** it produces (`sprint-status-v{N}.md`) keeps its name — a stable cross-phase contract read by Phase 7/8/11; renaming that is a separate change (schema + gate IDs + dashboard + graph-query keys) carried to the docs-regen pass (§8.11). Functional wiring repointed: `10-operate/gate.json` skill_ref + remediation, `ops-delta.schema.json` source_skill enum, `phase-transition` step-02a producer list, `devops.md` dispatch list, `10-operate/README.md`. |
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #18 Wave 10.2) | Phase 10 rewrite. Now serves as Phase 10 entry skill per Q1 — Step 0 absorbs entry-sync (graph-first 6 graph_queries; 9th-consumer staleness; ops-deltas WIP log init). Iterative versioning per user-defined cadence. Inputs converted to graph-first; reads deploy-log + readiness + wave-status + live-telemetry. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial sprint-status skill |
