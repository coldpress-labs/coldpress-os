---
name: "phase-transition-workflow"
skill: "phase-transition"
total_steps: 3
re_runnable: false
description: "3-step workflow: gate-check → reconciliation (conditional, from_phase=5 only) → handoff-log"
---

# Phase Transition — Workflow

## Overview

Two unconditional steps plus one conditional insert, always in sequence. Both are synchronous (Butler-driven). `trace` is derived in-memory per invocation, so there is no persistent knowledge-graph index to rebuild at a transition.

## Steps

| # | Step | Halts? | Critical |
|---|------|--------|---------|
| 1 | [Gate Check](steps/step-01-gate-check.md) | On block | Yes — blocks if gate fails |
| 2a | [Reconciliation (conditional)](steps/step-02a-reconciliation.md) | Per-delta | Yes when from_phase=5 with non-empty deltas |
| 3 | [Handoff Log](steps/step-03-handoff-log.md) | No | Yes — must write before new phase starts |

### Conditional reconciliation (step 2a)

Phase 5 introduces the `design_deltas` mechanism (deep-dive §7). When `from_phase == 5` and `_context/handoffs/phase-5-design-deltas-wip-{date}.md` has non-empty entries, step 2a runs **before** the handoff log is written. The reconciliation pass:

- Aggregates deltas from the WIP log
- Pattern 7 transition: @ux-designer → @pm
- Per-delta user prompt with 4 reconciliation_options (accept_into_prd / reject / flag_for_architecture_ADR / park_for_phase_11)
- For accept_into_prd: authors PRD v(N+1) lightweight amendment via `validate-prd --sections=<list>` re-validation; bumps PRD VC
- For flag_for_architecture_ADR: stages ADR-required marker for step-03 handoff log (silent-divergence guard — Phase 6 MUST author corresponding ADR)
- Pattern 7 transition: @pm → phase-transition

Step 2a is skipped when from_phase != 5 OR design-deltas WIP log is absent / empty.

## Inputs consumed

- `from_phase` and `to_phase` — passed by Butler at dispatch time
- `lifecycle/<from-phase>/gate.json` — gate spec for the outgoing phase
- `.coldpress/local-config.yaml` — current phase-completion markers

## Product-brief regen auto-detect (Step 3a)

When transitioning from Phase 2 → Phase 3, Step 3 performs an mtime compare:
- `_context/planning/product-brief-v{N}.md` mtime vs. `context.md` + synthesis mtime
- If context.md or synthesis was updated after the last product-brief version, Step 3 flags it: *"product-brief may be stale — regeneration recommended before Phase 3 locks the tech stack"*.

This is a warn (not block). User can dismiss and proceed.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-07-02 | Butler (v0.4 WS5, D15) | Removed dead Step 2 "Graph Rebuild" — `coldpress graph rebuild` and `src/graph/staleness.ts` were deleted in WS0 (§8 item 1, Graphify retirement). `trace` is derived in-memory per call, so there is no persistent index to rebuild at a transition. total_steps 4 → 3; step-01 next_step repointed to step-03 (2a conditional insert preserved); dropped `graph_rebuilt`/`graph_rebuild_error` handoff fields and the stale `graph.json` input. |
| 2.0 | 2026-04-30 | Butler (autonomous queue unit #3 Wave 5.8a) | Conditional step 2a (Phase 5 PRD reconciliation) added per Phase 5 deep-dive §7. Total steps 3 → 4 (3 unconditional + 1 conditional). Reconciliation aggregates `design_deltas`, runs Pattern 7 transitions (@ux-designer → @pm → phase-transition), prompts per-delta, authors PRD v(N+1) amendments via `validate-prd --sections` for accept_into_prd, stages flag_for_architecture_ADR markers for handoff log, parks deltas to product-evolution backlog. Skipped when from_phase != 5. |
| 1.0 | 2026-04-24 | Cadbury-hq | Initial workflow per Wave 4.5. |
