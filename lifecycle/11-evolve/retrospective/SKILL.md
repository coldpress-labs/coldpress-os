---
name: "retrospective"
description: "Phase 11 entry skill (per Q1). Step 0 absorbs entry-sync (graph-first context + ops-deltas reconciliation pass). Cause analysis for accept_into_phase_11_retrospective deltas + retrospective report emit. Owner @reviewer (Pattern 7 takeover from @devops)."
type: "workflow"
category: "lifecycle"
phase: 11
agent: "reviewer"
inputs:
  graph_queries:
    - "phase-10-to-11-handoff (with ops_deltas[])"
    - "sprint-status-iterations"
    - "deploy-log-v{latest}"
    - "course-correction-logs"
    - "wave-status-final"
    - "code-review-reports"
    - "implementation-readiness"
    - "all upstream phase artefacts (full provenance chain)"
    - "coldpress-yaml-baselines"
  cold_file_reads:
    - "_context/handoffs/phase-10-to-11-{date}.md (CRITICAL — ops_deltas[])"
  existence_checks:
    - "phase-10-to-11 handoff exists with ops_deltas[] array"
outputs:
  - artifact: "Retrospective Report"
    location: "_context/audit/retrospective-v{N}.md"
    format: "markdown"
    sacred: false
    distillate: true
    schema: "schemas/audit/retrospective.schema.json"
version: "2.0"
---

## Purpose

Phase 11 entry skill + reflective cause-analysis. Step 0 absorbs entry-sync work (graph-first context + 10th-consumer staleness + ops-deltas reconciliation pass). Subsequent steps perform cause analysis using problem_solving Tier-1 (root_cause + five_whys + fishbone) and emit retrospective report.

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

`_context/audit/retrospective-v{N}.md` — validated-distillate. Cause analysis + lessons learned + reconciled ops_deltas summary + recommendations forwarded to product-evolution + innovation-strategy.

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
