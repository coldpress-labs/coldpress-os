---
phase: 9
name: "Evolve"
description: "Post-release learning — retrospective, product evolution, innovation strategy. Cyclical; feeds insights back to earlier phases."
prerequisites:
  - "Phase 7 (Deployment) complete, or release milestone reached"
outputs:
  - "Retrospective reports"
  - "Product evolution plans"
  - "Innovation strategy outputs"
next_phase: "Loop back to any phase as needed"
---

# Phase 9: Evolve

> Post-release learning and planning. Reflect on what shipped, decide what's next, explore adjacent possibilities. Cyclical — the outputs feed forward into Phase 2 (Discovery) or Phase 4 (Planning) for the next cycle.

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [retrospective](retrospective/) | workflow | scrum-master | Post-epic / post-release review — lessons learned, systems-focused, no-blame |
| [product-evolution](product-evolution/) | workflow | pm | Plan the next iteration of the product based on observed usage + retrospective insights |
| [innovation-strategy](innovation-strategy/) | router | analyst | → `skills/creative/innovation-strategy/` — explore adjacent problem spaces |

## When to invoke

- After a release lands and stabilises → `retrospective`
- Roadmap for the next cycle → `product-evolution`
- Strategy work beyond the current product scope → `innovation-strategy`

## Cyclical feed-forward

Phase 9 outputs loop back:

- Retrospective insights → inform next sprint planning (Phase 5 Breakdown)
- Product evolution → restarts at Phase 4 (Planning) or Phase 2 (Discovery) depending on scale
- Innovation strategy → may spawn a new Phase 1 (Bootstrap) for an adjacent product

## What Phase 9 is NOT

Phase 9 is **not** in-flight course correction. Mid-sprint scope drift is Phase 8 (Operate). The split (introduced in Phase I Wave 4 §4.11) keeps reflective / learning work separate from keep-the-build-on-track work — they have different cadences, different artefacts, and different subagent owners.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-23 | Cadbury-hq | Phase 9 created as part of the Phase 8 split (Phase I Wave 4 §4.11). Sub-skills moved from the former Phase 8 (now Operate): retrospective, product-evolution, innovation-strategy. Framework is now a 9-phase lifecycle. |
