---
name: "synthesize-research"
description: "Consolidate all Phase 2 research + validation outputs into a single versioned synthesis artefact — themes, tensions, convergent signals — consumed by product-brief"
type: "workflow"
category: "lifecycle"
phase: 2
agent: "analyst"
versioned: true
inputs:
  - "_context/sacred/context.md (status: authored)"
  - "_context/planning/research/*.md (all domain / market / constraint / personas outputs)"
  - "_context/planning/idea-validation-v{N}.md (if validate-idea ran)"
  - ".coldpress/graph/graph.json (for cluster context)"
  - "_context/tracking/intake-{date}.md"
  - "data/methods/problem-solving-methods.csv (Systems Thinking, Morphological Analysis)"
outputs:
  - artifact: "Research Synthesis"
    location: "_context/planning/research-synthesis-v{N}.md"
    format: "markdown"
    versioned: true
version: "1.0"
---

## Purpose

Consolidates everything Phase 2 produced — authored `context.md`, all research outputs (domain / market / constraint / personas), and the latest `idea-validation-v{N}.md` — into a single synthesis artefact. Identifies themes, tensions, convergent vs divergent signals. The output becomes the **primary input** for `product-brief`, so the brief reads one consolidated doc instead of cross-consuming 4+ research fragments.

`synthesize-research` exists as a separate skill (not a Step in `product-brief`) so the synthesis artefact becomes its own graph node that Phase 3 and Phase 4 skills can query directly, and so synthesis iteration doesn't churn the executive brief.

## Versioning

Output is versioned — `research-synthesis-v{N}.md`. On re-run (e.g., after adding more research or a new `validate-idea` pass), the skill produces `v{N+1}` rather than overwriting `v{N}`. Previous versions stay for traceability.

`product-brief` always reads the latest `v{N}`.

## When to Use

- "synthesize research"
- "consolidate findings"
- After parallel research lane completes (domain / market / constraint / personas)
- After `validate-idea` runs (if it runs)
- Before `product-brief`

## Prerequisites

- `_context/sacred/context.md` has `status: authored` (pre-project-interview ran)
- At least 1 research doc exists in `_context/planning/research/`
- Graph has been indexed at least once

## Tier 1 — Core methods wired in

Per Phase II deep-dive v1.4 §Tier 1:

| Step | Core methods | Source CSV |
|---|---|---|
| Step 2 — Themes / tensions | **Systems Thinking**, **Morphological Analysis** | `data/methods/problem-solving-methods.csv` (diagnosis + synthesis) |

These are mandatory sub-routines, not optional router invocations.

## Utility wire-ins

| Step | Utility | Purpose |
|---|---|---|
| Step 3 | [distillator](../../../skills/utilities/distillator/) | Compress dense synthesis to LLM-optimised form |
| Step 4 | [adversarial-review](../../../skills/reviews/adversarial-review/) | Cynical critique — catches bias, missing counter-evidence, shallow takes |
| Step 4 | [editorial-structure](../../../skills/reviews/editorial-structure/) | Structural polish before product-brief consumes |
| Step 4 (opt-in) | [party-mode](../../../skills/utilities/party-mode/) | All 9 subagents cross-critique; Butler auto-offers in `user.cadence: verbose` OR `team_shape = client-project` |

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/planning/research-synthesis-v{N}.md` — a consolidated document containing:
- Themes (cross-cutting patterns across research outputs)
- Tensions (conflicts that Phase 3 / Phase 4 must resolve)
- Convergent signals (agreement across multiple sources — high-confidence inputs)
- Divergent signals (disagreement — decision points, not conclusions)
- Frontmatter per shared research-output schema (Wave 4.6)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial synthesize-research skill per Phase II Part 2 Wave 2.2. Separate skill, not a product-brief step (single-responsibility — synthesis becomes reusable graph node; iteration doesn't touch brief). Versioned output (v{N}, never overwrite). Tier 1 methods wired into Step 2 (Systems Thinking + Morphological Analysis). Utility wire-ins at Steps 3-4 (distillator, adversarial-review, editorial-structure; party-mode opt-in). |
