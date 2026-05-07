---
name: "innovation-strategy"
description: "Identify disruption opportunities and architect new business models during discovery"
type: "router"
category: "lifecycle"
phase: 2
routes_to: "skills/creative/innovation-strategy/"
agent: "analyst"
version: "1.0"
---

## Router

This is a lifecycle router. It makes the `innovation-strategy` skill available during Phase 2 (Discovery).

→ Read and follow `../../../skills/creative/innovation-strategy/SKILL.md`

## Phase 2 Context

During discovery, innovation-strategy is used to:
- Explore disruption angles before committing to a competitive positioning in `market-research`
- Find blue-ocean framings when the stated market feels crowded
- Stress-test differentiation claims surfaced by `validate-idea` Step 3 (when it lands in Wave 2.4)
- Apply structured frameworks (Blue Ocean, JTBD, Crossing the Chasm, Value Proposition Canvas) rather than freeform ideation

Several methods in the underlying catalog are already Tier 1 wire-ins for specific Phase 2 sub-skills:
- **Blue Ocean Strategy + Value Proposition Canvas + Competitive Positioning Map** → `validate-idea` Step 3 (differentiation)
- **Jobs to be Done** → `personas` Step 1 (archetype extraction) and `validate-idea` Step 4 (problem-solution fit)
- **Disruptive Innovation Theory + Crossing the Chasm** → `validate-idea` Step 6 (prior art / OSS landscape)

This router surfaces the broader 30-framework catalog for on-demand invocation beyond those specific wire points.

## Invocation

Examples of when Butler would invoke this router during Phase 2:
- *"Where's the blue ocean here?"* — Blue Ocean Strategy
- *"How do we differentiate without getting outbuilt?"* — Value Proposition Canvas
- *"What's the beachhead before we try to cross to mainstream?"* — Crossing the Chasm
- During `market-research` when competitive landscape feels like a red ocean
