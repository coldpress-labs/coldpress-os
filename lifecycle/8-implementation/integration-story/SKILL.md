---
name: "integration-story"
description: "Run a wave's IN-<n> integration story (P8) — the auto-generated sequential-merge + full-suite step that `coldpress waves` emits per wave. After every ST-*/CT-* story in the wave passes clean-room verification on its own branch, this sequentially merges them into the integration branch in contract-first dependency order, runs the test suite after each merge, resolves cross-story conflicts as real findings (not rebased away), and runs the FULL suite over the integrated wave. Green = the wave integrates; red = an integration finding back to @developer. git-guard reserves the integration branch for exactly this."
type: "workflow"
category: "lifecycle"
phase: 8
agent: "developer"
inputs:
  cold_file_reads:
    - "docs/generated/waves.yaml (the wave's stories + the IN-<n> id)"
    - "_context/implementation/story-graph.yaml (dependency edges for merge order)"
    - "_context/tracking/sprint-status.yaml (which stories are `review`/`done`)"
    - "the per-story branches (each ST-*/CT-* verified + green)"
outputs:
  - artifact: "Integrated wave (on the integration branch) + integration record"
    location: "_context/audit/integration-{wave}-{date}.md"
    format: "markdown + git state"
    sacred: false
version: "1.0"
---

## Purpose

Stories are built in isolation on their own branches (boundary-guard keeps each inside its `owns` globs, so waves parallelise cleanly). But isolation is a lie until the pieces are put together — two green stories can still break at the seam. The `IN-<n>` integration story is where that seam is tested: `coldpress waves` auto-generates one per wave, git-guard reserves the integration branch for it, and this skill runs the actual procedure — sequential merge, per-merge suite, conflict-as-finding, full-suite-over-the-wave. Without it the IN-* stories the framework emits + guards have no executor (the retired `wave-orchestration` never got a successor for this).

## When to Use

- At the END of a wave, once every ST-*/CT-* story in it is `review`/`done` (verified clean-room). Butler dispatches the wave's `IN-<n>`.
- Never mid-wave — integration is a whole-wave step, not per-story.

## Prerequisites

- Every story in the wave has passed `verify-story` (a `pass` verdict) and lives on its own branch, green.
- The integration branch exists and is where IN-* lands (git-guard blocks non-integration writes to it).

## Process

1. **Determine the merge order** from `story-graph.yaml`: **contract stories (CT-*) first** (they define the shared types/API the others depend on), then the remaining stories in topological order of the `blocks`/`interface` edges. A wave's stories are `owns`-disjoint, so file conflicts should be rare — a conflict that DOES appear is a genuine integration finding (two stories reaching for the same seam), not a rebase-away.

2. **Sequential merge — one story at a time:**
   - Merge the next branch into the integration branch.
   - Run the **fast** test layers (L0 static + L1 unit) immediately. A regression here is attributable to *this* merge — fix it now, not after ten merges pile up.
   - A merge **conflict** is recorded as an integration finding: resolve it deliberately (whose contract wins), and if it reveals a missing dependency edge, that's a story-graph delta to forward-carry — don't silently paper over it.

3. **Full-suite over the integrated wave.** After all stories are merged, run the **full** test suite (L0–L4+ as `testing.yaml` declares) against the integrated result. Cross-story behaviour that no single story's tests covered surfaces here — that's the whole point of the step.

4. **Verdict:**
   - **Green** → the wave integrates. Mark the wave complete in `sprint-status.yaml`; the integration branch now holds the working wave. Butler proceeds to the next wave (or readiness if it was the last).
   - **Red** → the failing behaviour is an **integration finding** routed to `@developer` (with the failing test + the two stories at the seam); re-verify + re-integrate. An integration failure is never "just merge it" — it is exactly the risk waves exist to catch early.

5. **Record** `_context/audit/integration-{wave}-{date}.md`: merge order, any conflicts + resolutions, the full-suite result, and any story-graph deltas surfaced.

## Output

An integrated, full-suite-green wave on the integration branch + the integration record. The wave is marked complete in `sprint-status.yaml`. Feeds the next wave (or P9 readiness).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-04 | Butler (v0.4 WS10-C7) | NEW P8 producer (system-integration audit C7: `coldpress waves` auto-generates `IN-<n>` integration stories per wave + git-guard reserves the integration branch for them, but NO skill implemented the sequential-merge procedure — `wave-orchestration` was retired without a successor for it). Implements contract-first sequential merge + per-merge fast suite + conflict-as-finding + full-suite-over-the-wave; a red integration is a finding to @developer, never a silent merge. |
