---
name: retrospective
description: Phase 11 entry skill (per Q1). Step 0 absorbs entry-sync (graph-first context + ops-deltas reconciliation pass). Cause analysis for accept_into_phase_11_retrospective deltas + retrospective report emit. Owner @reviewer (Pattern 7 takeover from @devops).
license: MIT
compatibility: Invoked by @reviewer in Phase 11
version: "2.0"
---

## Purpose

Phase 11 entry skill + reflective cause-analysis — a **product** retrospective, not
just a process one, and **evidence-linked** (@reviewer on **opus**, read-only). Step 0
absorbs entry-sync. It reads:

- **`.coldpress/runs/*.jsonl` (EventStream)** — the run arc; **every claim must cite a
  run-log event ID** (scripted check — no un-evidenced lessons).
- **`outcomes.yaml` actual-vs-target** (from the P10 ops-check digests) — did the product
  achieve what it was built for? Outcome misses are first-class retro findings.
- **parked DLTs** + the ops-deltas reconciliation.
- **failure-lineage via `trace`** — "which requirement generated the most failures?" — plus
  the run's failure-taxonomy tags (feeding `framework-feedback` → the WS7 loop).

Reads CRITICALLY: phase-10-to-11 handoff `ops_deltas[]` array. Per delta:
- `accept_into_phase_11_retrospective` → analyse cause; document in retro
- `accept_into_phase_11_product_evolution` → forward to product-evolution skill (queue)
- `immediate_corrective_action` → log only (already addressed at Phase 10)
- `park_for_phase_11` → revisit during retro; may upgrade to product-evolution

Aggregated reconciliation status emitted as part of retro report.

## When to Use

- Phase 11 entry — invoked by user-triggered retrospective at Phase 10 → 11 transition.

## Prerequisites

- Phase 10 user-invoked exit
- phase-10-to-11 handoff written

## Output

`_context/audit/retrospective-v{N}.md` — validated-distillate. **Product + process** retrospective: outcomes actual-vs-target, evidence-linked lessons (each citing a run-log event ID), failure-lineage, reconciled ops_deltas. Recommendations fork three ways: **product** → `product-evolution` backlog; **framework** → `framework-feedback` (issues against coldpress-os); **reusable wins** → `pack-harvest`.

## Cross-cutting wire-ins

- `adversarial-review` — retro red-team (challenge lessons-learned conclusions)
- `editorial` — retro prose polish
- `editorial` — report structure

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #19 Wave 11.1 — FINAL UNIT) | Phase 11 rewrite. Now serves as Phase 11 entry skill per Q1 — Step 0 absorbs entry-sync (graph-first 9 graph_queries; 10th-consumer staleness; ops-deltas reconciliation pass per Q2). Reads CRITICALLY: phase-10-to-11 handoff ops_deltas[] (4th forward-carry consumption point). Outputs: retrospective-v{N}.md validated-distillate. Cross-cutting: adversarial-review + editorial. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial retrospective skill |
