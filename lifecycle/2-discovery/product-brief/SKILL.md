---
name: "product-brief"
description: "Distil Phase 2 Discovery outputs into a 1-2 page executive product brief (validated distillate — not sacred, versioned, regeneratable)"
type: "workflow"
category: "lifecycle"
phase: 2
agent: "analyst"
tier: "distillate"
schema: "schemas/distillates/product-brief.schema.json"
versioned: true
regeneratable: true
inputs:
  - "_context/sacred/context.md"
  - "_context/planning/research-synthesis-v{N}.md"
  - "_context/planning/research/ (domain, market, constraint, personas)"
  - "_context/planning/idea-validation-v{N}.md (if validate-idea ran)"
  - "_context/tracking/intake-{date}.md"
  - ".coldpress/local-config.yaml (for project_shape + team_shape)"
  - ".coldpress/graph/graph.json (supersede-check against _input/)"
outputs:
  - artifact: "Product Brief"
    location: "_context/planning/product-brief-v{N}.md"
    format: "markdown"
    tier: "distillate"
    versioned: true
    regeneratable: true
  - artifact: "Product Brief Distillate (optional, LLM-optimised)"
    location: "_context/planning/product-brief-distillate-v{N}.md"
    format: "markdown"
    tier: "distillate"
    versioned: true
version: "2.0"
---

## Purpose

Distils Phase 2 Discovery into a concise 1-2 page executive brief: product vision, target users, value proposition, key features, success metrics, and strategic direction — framed for stakeholders and downstream planning.

Product-brief is the **last workflow skill in Phase 2**, not the first skill in Phase 4. It reads the synthesis version produced by `synthesize-research` (which already consolidated all the research outputs) and renders the executive view on top. It does not re-synthesise research.

**Tier — validated distillate (not sacred):** product-brief has its own schema (`schemas/distillates/product-brief.schema.json`), ships versioned (`product-brief-v{N}.md`), and is regeneratable when upstream artefacts (`context.md`, `research-synthesis-v{N}.md`) change. Block-severity at the Phase 2 gate.

## When to Use

- "create product brief"
- "write a product brief"
- After `synthesize-research` has produced the latest synthesis version
- Always the **last** workflow skill in Phase 2 (distillation — reads synthesis, produces executive brief)
- When you need a stakeholder-ready distillate of Discovery findings before Phase 3 stack selection

## Activation Modes

| Mode | Flag | Behavior |
|------|------|----------|
| **Guided** | _(default)_ | Step-by-step collaborative discovery with user input at each step |
| **Autonomous** | `-A` | Agent drafts the brief from existing docs, presents for review |
| **Yolo** | `--yolo` | Agent drafts and writes without stopping — user reviews after |

## Prerequisites

- Phase 2 upstream complete: `_context/sacred/context.md` has `status: authored`
- Latest `research-synthesis-v{N}.md` exists in `_context/planning/`
- (Optional but recommended) `idea-validation-v{N}.md` if `validate-idea` ran

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/planning/product-brief-v{N}.md` — a concise executive product brief, validated against `schemas/distillates/product-brief.schema.json`. Optionally, a distillate version for LLM-optimised reference.

## Regeneration

Product-brief is regeneratable. When upstream artefacts change (sacred `context.md` edit via change-workflow, new `research-synthesis-v{N+1}.md`), `phase-transition` auto-detects staleness via mtime and prompts regeneration to `v{N+1}`. Out-of-phase regeneration via `coldpress regen product-brief` (post-v0.3 CLI — forward-carried).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 1.3 — relocated from Phase 4 to Phase 2 (last workflow skill, not first). Prerequisites: strip "Phase 3 complete (tech stack selected)"; require Phase 2 upstream (context.md `status: authored` + research-synthesis-v{N}). Inputs: remove `_context/sacred/tech-stack.md`; add `research-synthesis-v{N}.md`, per-research docs, `idea-validation-v{N}.md`, `intake-{date}.md`. Declared **validated-distillate tier** (FP13) — own schema at `schemas/distillates/product-brief.schema.json`, versioned output (`product-brief-v{N}.md`, not `{date}.md`), regeneratable on upstream change. Block-severity at Phase 2 gate. |
| 1.0 | 2026-04-08 | Alfred | Initial product-brief skill definition |
