---
name: product-brief
description: Synthesize Phase 2 Discovery research, then distil it into a 1-2 page executive product brief (validated distillate — not sacred, versioned, regeneratable)
license: MIT
compatibility: Invoked by @analyst in Phase 2
version: "3.0"
---

## Purpose

Consolidates all Phase 2 Discovery research into a versioned synthesis (Step 1), then distils that synthesis into a concise 1-2 page executive brief: product vision, target users, value proposition, key features, success metrics, and strategic direction — framed for stakeholders and downstream planning.

Product-brief is the **last workflow skill in Phase 2**, not the first skill in Phase 4. Its own Step 1 produces the synthesis (themes, tensions, convergent/divergent signals) that Steps 2-5 then render as the executive view. Synthesis and drafting used to be two separate skills; they're one re-runnable multi-step skill now (WS5-B) since neither had a reason to be invoked independently of the other.

**Tier — validated distillate (not sacred):** product-brief has its own schema (`schemas/distillates/product-brief.schema.json`), ships versioned (`product-brief-v{N}.md`), and is regeneratable when upstream artefacts (`context.md`, research inputs) change. Block-severity at the Phase 2 gate.

## When to Use

- "create product brief"
- "synthesize research"
- "write a product brief"
- After the parallel research lane completes (domain / market / constraint / personas)
- Always the **last** workflow skill in Phase 2 (synthesizes research, then distils into an executive brief)
- When you need a stakeholder-ready distillate of Discovery findings before Phase 3 stack selection

## Activation Modes

| Mode | Flag | Behavior |
|------|------|----------|
| **Guided** | _(default)_ | Step-by-step collaborative discovery with user input at each step |
| **Autonomous** | `-A` | Agent drafts the brief from existing docs, presents for review |
| **Yolo** | `--yolo` | Agent drafts and writes without stopping — user reviews after |

## Prerequisites

- Phase 2 upstream complete: `_context/sacred/context.md` has `status: authored` (Phase 1 `intake` ran)
- At least 1 research doc exists in `_context/planning/research/` (Step 1 synthesizes whatever is there — thinner with fewer, but not blocked)
- (Optional but recommended) `idea-validation-v{N}.md` if `validate-idea` ran

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/planning/research-synthesis-v{N}.md` (Step 1) and `_context/planning/product-brief-v{N}.md` (Step 5) — the latter validated against `schemas/distillates/product-brief.schema.json`. Optionally, a distillate version for LLM-optimised reference.

## Regeneration

Both outputs are regeneratable. When upstream artefacts change (sacred `context.md` edit via the `sacred-change` skill, new research landing), `phase-transition` auto-detects staleness via mtime and prompts regeneration to `v{N+1}` for both the synthesis and the brief. Out-of-phase regeneration via `coldpress regen product-brief` (post-v0.3 CLI — forward-carried).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-07-02 | Butler | Absorbed `synthesize-research` as Step 1 (WS5-B, §8 item 6) — this skill now produces both `research-synthesis-v{N}.md` and `product-brief-v{N}.md` instead of only reading a synthesis produced elsewhere. Dropped the dead `.coldpress/graph/graph.json` input (WS0 §8 item 1). `context.md` prerequisite corrected to Phase 1 `intake` (WS5-B — pre-project-interview no longer authors it). Dead `governance change-workflow` reference replaced with `sacred-change` (WS1-G). |
| 2.0 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 1.3 — relocated from Phase 4 to Phase 2 (last workflow skill, not first). Prerequisites: strip "Phase 3 complete (tech stack selected)"; require Phase 2 upstream (context.md `status: authored` + research-synthesis-v{N}). Inputs: remove `_context/sacred/tech-stack.md`; add `research-synthesis-v{N}.md`, per-research docs, `idea-validation-v{N}.md`, `intake-{date}.md`. Declared **validated-distillate tier** (FP13) — own schema at `schemas/distillates/product-brief.schema.json`, versioned output (`product-brief-v{N}.md`, not `{date}.md`), regeneratable on upstream change. Block-severity at Phase 2 gate. |
| 1.0 | 2026-04-08 | Alfred | Initial product-brief skill definition |
