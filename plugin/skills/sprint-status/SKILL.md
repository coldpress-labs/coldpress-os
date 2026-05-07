---
name: sprint-status
description: Phase 10 entry skill (per Q1) + iterative orchestrator. Step 0 absorbs entry-sync (graph-first context + 9th-consumer staleness + ops-deltas WIP log init). Versioned per iteration as v{N}, v{N+1}, ... per user-defined cadence.
license: MIT
compatibility: Invoked by @devops in Phase 10
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

Step 0 initialises `_context/handoffs/phase-10-ops-deltas-wip-{date}.md`. correct-course / sprint-status / document-project append `ops_delta` entries during execution. Aggregated by phase-transition at user-invoked Phase 11 transition.

## Cross-cutting wire-ins

- `editorial-structure` — sprint-status report polish

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #18 Wave 10.2) | Phase 10 rewrite. Now serves as Phase 10 entry skill per Q1 — Step 0 absorbs entry-sync (graph-first 6 graph_queries; 9th-consumer staleness; ops-deltas WIP log init). Iterative versioning per user-defined cadence. Inputs converted to graph-first; reads deploy-log + readiness + wave-status + live-telemetry. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial sprint-status skill |
