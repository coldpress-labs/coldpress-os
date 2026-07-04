---
name: "story-graph"
description: "Phase 7 — author _context/implementation/story-graph.yaml from the sliced stories: typed dependency edges (blocks/interface/informs) + ownership, every interface edge backed by a contract story. Then run `coldpress waves` — waves, critical path, and schedule are COMPUTED, never hand-authored. Generates the initial sprint-status tracking file. PERT chart is retired (waves supersede it)."
type: "workflow"
category: "lifecycle"
phase: 7
agent: "pm"
tools: ["Read", "Write", "Bash"]
inputs:
  - "_context/implementation/stories/ST-*.md + stories-index.md (from story-slice)"
  - "_context/architecture/api-contract (interface surfaces → contract stories)"
outputs:
  - artifact: "Story graph (typed edges + ownership)"
    location: "_context/implementation/story-graph.yaml"
    format: "yaml"
  - artifact: "Derived wave plan + schedule (COMPUTED by `coldpress waves`)"
    location: "docs/generated/{waves,schedule}.yaml"
    format: "yaml"
  - artifact: "Initial sprint-status tracking file"
    location: "_context/tracking/sprint-status.yaml"
    format: "markdown"
version: "1.0"
---

## ATTENTION

This is a **high-stakes, machine-parsed** skill. `story-graph.yaml` is consumed by
`coldpress waves` under a strict schema — malformed edges, a cycle, a missing
contract story, or overlapping `owns` globs cause `waves` to **reject** the graph
and block Phase 7 exit. Author the graph exactly to `story-graph.schema.ts`; do not
hand-author waves, ordering, or a schedule — those are **computed**.

## Purpose

Wire the sliced stories into a **typed dependency graph** and let the machine
compute parallelism. `story-slice` produced stories with `owns`/`produces`/
`consumes` metadata; `story-graph` turns that into `story-graph.yaml` (the §4.7
schema), then runs **`coldpress waves`** — which computes the wave plan, critical
path, and schedule and **rejects** cycles, missing contract stories, and
intra-wave ownership overlaps. Parallelism is *designed* here so Phase 8 merely
executes it. (High-stakes prompt discipline per §6.7 — see `docs/prompt-patterns.md`.)

**PERT is retired.** The old sacred PERT chart is superseded by the computed wave
plan; `pert-chart.schema.json` and the `pert-change` governance workflow are gone
(§5 P7 / §8 item 10). Waves/critical-path/schedule are **computed, never authored**.

## When to Use

- Phase 7, after `story-slice` (needs the sliced stories) and before `implementation-readiness`.

## Prerequisites

- `story-slice` complete: `ST-*.md` contracts with `owns`/`produces`/`consumes`, o/m/p estimates, risk, and (for interfaces) contract stories.
- `coldpress` CLI available (runs `coldpress waves`).

## Process

Five steps — see [workflow.md](workflow.md):

1. **Edges** — derive typed edges from the stories: a `consumes` that matches
   another story's `produces` is a `blocks` edge; a shared interface surface is an
   `interface` edge; soft dependencies are `informs`.
2. **Emit graph** — write `_context/implementation/story-graph.yaml` per
   `schemas/story-graph.schema.ts` (stories with estimates/risk/kind + typed edges + ownership).
3. **Contract stories** — every `interface` edge must resolve to a `kind: contract`
   story (extracted at story-slice from the api-contract); a missing one is a gap to fix.
4. **Waves** — run `coldpress waves`: it validates the graph and emits the derived
   `waves.yaml` + `schedule.yaml` (critical path = (o + 4m + p)/6). It **rejects** a
   cycle, a missing contract story, or an intra-wave ownership overlap — fix the graph, don't override.
5. **Tracking** — generate the initial `sprint-status.yaml` tracking file from the
   stories × wave assignment (every story assigned to a wave, status `ready-for-dev`).

## Output Contract

- `_context/implementation/story-graph.yaml` — schema-valid (`story-graph.schema.ts`), acyclic.
- `docs/generated/waves.yaml` + `schedule.yaml` — **computed** by `coldpress waves`, never authored; includes a **mandatory** `mermaid` wave/critical-path diagram (a forcing-function view — the graph must render as a legible DAG).
- `_context/tracking/sprint-status.yaml` — every story assigned to exactly one wave.

Hand off to `implementation-readiness` (P7 exit gate).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS5-E) | REBUILD from `parallelization-strategy` (§5 P7). Now authors `story-graph.yaml` (typed edges blocks/interface/informs + ownership, per the WS2 `story-graph.schema.ts`) and runs **`coldpress waves`** — waves/critical-path/schedule are computed, never authored. Every interface edge must have a `kind: contract` story. **PERT retired**: dropped the sacred PERT-chart authoring step; `pert-chart.schema.json` + `pert-change` governance workflow removed; P7/P8 gate PERT checks replaced. Absorbs the WS5-B sprint-status generation (steps 4-6) as the tracking step, now driven by wave assignment. |
