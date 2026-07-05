---
name: "stack-evaluation"
description: "Evaluate technology candidates for a single decision-area using a 6-dimension rubric. Tier-aware: T1 pack pre-picks use a fast-path; T2 catalog and T3 independent paths walk the full rubric. Produces versioned, schema-validated ADRs."
type: "workflow"
category: "lifecycle"
phase: 3
agent: "architect"
inputs:
  - "_context/planning/stack-shortlist-v{N}.md"
  - "_context/sacred/context.md"
  - "_context/planning/product-brief-v{N}.md"
  - "_context/planning/idea-validation-v{N}.md"
  - "_context/planning/research/personas-*.md"
  - "_context/planning/research/constraint-*.md"
  - "_context/planning/research-synthesis-v{N}.md"
  - "_input/vendor/*"
  - ".coldpress/graph/graph.json"
  - ".coldpress/local-config.yaml"
  - "data/classification/project-types.csv"
  - "data/methods/problem-solving-methods.csv"
outputs:
  - artifact: "Architecture Decision Record"
    location: "_context/planning/adrs/adr-{decision}-v{N}.md"
    format: "markdown"
    versioned: true
    schema: "schemas/planning-artefacts/adr.schema.json"
version: "2.0"
---

## Purpose

Evaluates technology options for a single decision area (one run per area). Reads the stack shortlist entry for the area to determine which tier applies, then follows the appropriate path: T1 fast-path (pack pre-pick, minimal rubric) or T2/T3 full 6-dimension rubric walk. Produces a versioned, schema-validated ADR.

**6-dimension rubric:** fit / cost / team-familiarity / ecosystem-maturity / lock-in / vibe-fit. Weights tuned per `user.team_shape` + `project_shape` + `product_type` (resolved at dispatch).

## When to Use

- "evaluate {decision area}" (e.g., "evaluate our frontend choice")
- "help me decide on {technology A vs B}"
- "create an ADR for {decision}"
- Run once per area from the stack-shortlist (after stack-discovery-sync)

## Prerequisites

- `_context/planning/stack-shortlist-v{N}.md` authored (run stack-discovery-sync first)
- `_context/sacred/context.md` locked

## Tier 1 Core Methods

- **Step 2 (rubric — all tiers):** Decision Matrix + Cost Benefit Analysis + Risk Assessment Matrix — cited from `data/methods/problem-solving-methods.csv` (evaluation category)
- **Step 3 (decide):** Architecture Decision Records method + Force Field Analysis — cited from `data/methods/problem-solving-methods.csv`

`advanced-elicitation` wire-in: fires on vague / hedged user answers during Step 2 rubric walk and Step 3 decision confirmation.

## Process

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/planning/adrs/adr-{decision}-v{N}.md` — versioned, schema-valid ADR with 6-dim rubric scores and explicit `tier: T1|T2|T3` frontmatter.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-24 | Cadbury-hq | Phase II Part 3 Wave 2 rewrite: tier-aware evaluation (T1 fast-path / T2-T3 full rubric), 6-dim rubric, evidence-bound inputs from shortlist, versioned ADRs under adrs/ subdir, schema validation, advanced-elicitation wire-in. |
| 1.0 | 2026-04-08 | Alfred | Initial stack-evaluation skill for Phase 3 |
