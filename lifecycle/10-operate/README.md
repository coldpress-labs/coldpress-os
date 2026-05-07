---
phase: 8
name: "Operate"
description: "In-flight work — course corrections, sprint status, continuous documentation while the build runs"
prerequisites:
  - "Phase 6 (Implementation) active, or Phase 7 (Deployment) complete"
outputs:
  - "Sprint change proposals"
  - "Sprint status reports"
  - "Updated project documentation"
next_phase: "9-evolve"
---

# Phase 8: Operate

> In-flight operational work — not post-release reflection. Runs **alongside** Phase 6-7 to keep the build on track, document what's happening as it happens, and absorb scope shifts without derailing the plan. Post-release learning is Phase 9 (Evolve).

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [correct-course](correct-course/) | workflow | scrum-master | Manage significant changes during a sprint — scope drift, blocker resolution, re-planning |
| [sprint-status](sprint-status/) | workflow | scrum-master | Summarise where a sprint stands, recommend the next move |
| [document-project](document-project/) | router | communicator | → `skills/utilities/document-project/` — keep project docs current as the work evolves |

## When to invoke

- Mid-sprint scope drift → `correct-course`
- Stand-ups / sprint reviews → `sprint-status`
- New subsystem shipping and the docs haven't caught up → `document-project`

## What Phase 8 is NOT

Phase 8 is **not** retrospectives. Retros are reflective, post-epic / post-release work — that's Phase 9 (Evolve). The split (introduced in Phase I Wave 4 §4.11) reflects that in-flight course correction and post-release learning are genuinely different workflows fused into one phase by historical accident — not the same activity at different cadences.

If you're mid-build and something is going sideways: Phase 8.
If the build shipped and you're deciding what to learn / do next: Phase 9.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-23 | Cadbury-hq | Phase 8 renamed from "Evolve" to "Operate" per the Phase 8 split (Phase I Wave 4 §4.11). Kept: correct-course, sprint-status, document-project. Moved to new Phase 9 (Evolve): retrospective, product-evolution, innovation-strategy. |
| 1.0 | 2026-04-13 | Alfred | Initial Phase 8 definition (pre-split name: "Evolve"). |
