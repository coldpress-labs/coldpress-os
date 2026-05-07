---
name: wave-orchestration
description: Phase 8 entry skill (per Q1) + orchestrator. Step 0 absorbs entry-sync (graph-first context + ci-pipeline + test-framework dispatch + implementation-deltas WIP log init). Subsequent steps drive wave-by-wave story execution per PERT chart with @qa sub-persona transitions.
license: MIT
compatibility: Invoked by @developer in Phase 8
version: "2.0"
---

## Purpose

Phase 8 entry skill + wave-by-wave orchestrator. Replaces both old `entry-sync` step pattern AND original wave-orchestration in one skill (per Q1).

**Step 0 absorbs entry-sync work:**
- Graph-first context load (12 graph_queries; 7th consumer of staleness helper)
- ci-pipeline dispatch (one-time setup pre-Wave-1 per Q5)
- test-framework dispatch (@qa Pattern 7 sub-transition #11a)
- implementation-deltas WIP log init at `_context/handoffs/phase-8-implementation-deltas-wip-{date}.md`

**Subsequent steps drive the wave loop:**
- Outer loop over PERT waves
- Inner loop over stories per wave: dispatch dev-story (or quick-dev per archetype) → test-design → atdd (if standard / WDS) → qa-automation → code-review (@qa sub-transition #11c)
- Per-wave: wave-status update + qa-automation full run + per-wave gate evaluation
- After last wave: invoke phase-transition for Phase 8 exit

## When to Use

- Phase 8 — invoked automatically as the first Phase 8 skill after `phase-transition` writes phase-7-to-8 handoff.

## Prerequisites

- Phase 7 gate passed
- PERT sacred + locked
- All per-story files validated

## Process

Multi-step orchestrator workflow.

→ See [workflow.md](workflow.md).

## Output

`_context/tracking/wave-status-v{N}.md` — validated-distillate. Per-wave status (waves[i] = {wave_id, story_ids, status, started_at, completed_at, blockers}).

## Pattern 7 sub-transitions invoked

- #11a: @developer → @qa (test-framework one-time setup at Step 0)
- #11b: @qa → @developer (back to wave execution after framework setup)
- #11c: @developer → @qa (code-review per story; recurring)
- #11d: @qa → @developer (back after code-review)

## Implementation-deltas (forward-carry)

If dev-story / quick-dev / code-review / qa-automation surface PRD/UX/architecture gaps during wave execution, surface as `implementation_delta` in WIP log. Aggregated at Phase 8 EXIT by phase-transition step-02a-reconciliation (extended for from_phase==8).

## Cross-cutting wire-ins

- `adversarial-review` — wired into code-review per Q6
- `editorial-structure` — wave-status report polish

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #12 Wave 8.2) | Phase 8 rewrite. Now serves as Phase 8 entry skill per Q1 — Step 0 absorbs entry-sync work (graph-first 12 graph_queries; ci-pipeline + test-framework dispatch; implementation-deltas WIP log init; 7th-consumer staleness helper). Inputs converted to graph-first; expanded to include all upstream artefacts (PERT, stories, sprint-status, architecture, ADRs, brand-guidelines, prototype-manifest, breakdown-scope, baselines, archetype, legacy). Outputs: wave-status-v{N}.md validated-distillate with schema. Pattern 7 fourth-invocation sub-transitions (#11a/#11b/#11c/#11d) wired. Implementation-deltas WIP-log mechanism activated. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial wave-orchestration skill |
