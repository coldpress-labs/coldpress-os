---
workflow_version: "1.0"
skill: "story-graph"
total_steps: 5
re_runnable: true
---

# Story Graph — Workflow

## Overview

Turn the sliced stories into a typed dependency graph and let the machine compute
the wave plan: derive edges → emit `story-graph.yaml` → verify contract stories →
run `coldpress waves` (computed waves/critical-path/schedule) → generate the
initial tracking file. Nothing about the schedule is hand-authored.

## Steps

| # | Step | Halts? | Notes |
|---|------|--------|-------|
| 1 | [step-01-edges.md](steps/step-01-edges.md) | No | Derive typed edges (blocks/interface/informs) from story owns/produces/consumes |
| 2 | [step-02-emit-graph.md](steps/step-02-emit-graph.md) | No | Write `story-graph.yaml` per `story-graph.schema.ts` |
| 3 | [step-03-contract-stories.md](steps/step-03-contract-stories.md) | On gap | Every `interface` edge has a `kind: contract` story |
| 4 | [step-04-waves.md](steps/step-04-waves.md) | On rejection | `coldpress waves` computes + validates (cycle / missing contract / ownership overlap) |
| 5 | [step-05-tracking.md](steps/step-05-tracking.md) | No | Initial `sprint-status-v{N}.md` from stories × wave assignment |

## Completion Criteria

- `story-graph.yaml` schema-valid + acyclic (`coldpress waves` accepts it).
- Every `interface` edge resolves to a `kind: contract` story.
- Intra-wave ownership is disjoint (waves rejects overlaps).
- `waves.yaml` + `schedule.yaml` emitted; every story assigned to a wave in the tracking file.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS5-E) | Initial story-graph workflow (rebuild of parallelization-strategy, §5 P7). PERT authoring dropped; `coldpress waves` computes the plan. |
