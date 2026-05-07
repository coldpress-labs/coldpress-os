---
name: "brand-guidelines"
description: "Phase 5 — author the canonical brand-guidelines validated-distillate. Scope (iii) broadest: design tokens (colour/type/spacing/motion) + voice + tone + a11y-baseline-driven contrast/keyboard rules + identity (logo treatment, iconography style). Single source of truth for downstream phases (Phase 6 architecture, Phase 8 implementation, Phase 9 deployment)."
type: "workflow"
category: "lifecycle"
phase: 5
agent: "ux-designer"
inputs:
  graph_queries:
    - "prd-v{latest}"
    - "design-brief-v{latest}"
    - "personas-v{latest}"
    - "coldpress-yaml-baselines"
    - "tech-stack-md"
    - "archetype-mode"
  cold_file_reads:
    - "_context/handoffs/phase-4-to-5-{date}.md"
    - "_context/planning/design-brief-v{latest}.md"
  existence_checks:
    - "design-brief-v{latest} exists"
    - "baselines.a11y_axis declared"
outputs:
  - artifact: "Brand Guidelines"
    location: "_context/design/brand-guidelines-v{N}.md"
    format: "markdown"
    sacred: false
    distillate: true
    schema: "schemas/design/brand-guidelines.schema.json"
  - artifact: "Brand Guidelines sidecar"
    location: "_context/design/brand-guidelines-v{N}.meta.json"
    format: "json"
version: "1.0"
---

## Purpose

Phase 5 — author the canonical brand-guidelines artefact. Single reference for tokens (colour, typography, spacing, motion), brand voice + tone (with persona-resonant samples), accessibility-baseline-driven contrast/keyboard/screen-reader rules, and visual identity (logo treatment, iconography style).

Scope (iii) broadest, decided per Q3 in deep-dive Round 2: tokens + voice + tone + a11y rules + identity. **Validated-distillate** — regeneratable from design-brief + personas + baselines + tech-stack. Schema-validated. Versioned. NOT sacred (avoids governance friction on every brand iteration).

`ux-design-spec.md` Section 8 references this artefact as the canonical token home — no token duplication.

## When to Use

- "create brand guidelines"
- "brand guidelines"
- Phase 5 — invoked after `design-brief` (parallel-OK with `ux-design`).

## Prerequisites

- `design-brief-v{latest}.md` exists (provides visual direction + voice direction)
- `coldpress.yaml baselines.a11y_axis` declared

## Process

5-step guided workflow. Step 0 is graph-first context load.

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/design/brand-guidelines-v{N}.md` validated-distillate covering:

1. Voice + tone (3–5 traits with samples; persona-resonant)
2. Design tokens — colour palette + typography pairs + spacing scale + motion principles
3. A11y rules — baseline-driven contrast minimums, keyboard nav rules, screen-reader rules
4. Identity — logo treatment specifications + iconography style guide

Token tables auto-validated against active a11y baseline contrast minimums. Failures raise supersede-check; user adjusts tokens or downgrades a11y opt-in via Phase 3 baselines re-entry.

## Cross-cutting wire-ins

- `editorial-prose` — Step 2 voice/tone polish; Step 4 identity description polish
- `editorial-structure` — Step 4 finalisation (full-doc structure check)
- `advanced-elicitation` — Steps 2, 3, 4 (vague_voice / vague_token_value / vague_brand_identity triggers)
- `brainstorming` — Steps 2, 3 (round_robin, scamper for tokens; round_robin, what_if_mashup for voice)
- `story_types` — Step 2 (`brand_voice_samples` type)

## Method playbook

`brainstorming` heavy (Steps 2 + 3); `advanced_elicitation` heavy; `story_types` for voice samples; `design_thinking` ideate stage for token systems.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-30 | Butler (autonomous queue unit #3 Wave 5.4) | Initial `brand-guidelines` skill — NEW under Shape A. Resolves deep-dive findings B17 (no canonical brand-guidelines home), B25 (ux-design-spec Section 8 token-scope conflict resolved by referencing this skill's output). Scope (iii) per Q3 — broadest: tokens + voice + tone + a11y + identity. Validated-distillate per Q4 (NOT sacred). 5-step workflow with graph-first inputs per §7b.3. Tier-1 method wire-ins: brainstorming (round_robin/scamper for tokens, voice exploration), advanced-elicitation (vague-style triggers), story_types (brand_voice_samples). Token tables auto-validated against active a11y baseline contrast minimums (B7 supersede-check pattern). Cross-cutting wire-ins: editorial-prose Step 2, editorial-structure Step 4. Schemas/template emitted. |
