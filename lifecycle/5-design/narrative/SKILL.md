---
name: "narrative"
description: "Phase 5 — author the canonical narrative validated-distillate (product story / persona scenarios / value-prop narrative / brand-voice samples). Thin wrapper around `skills/creative/storytelling/` — frames inputs (personas + value prop + brand-guidelines voice), invokes the cross-cutting creative skill, lands the artefact at `_context/design/narrative-v{N}.md`. Per Q5 hybrid resolution."
type: "workflow"
category: "lifecycle"
phase: 5
agent: "ux-designer"
delegates_to: "skills/creative/storytelling"
inputs:
  graph_queries:
    - "personas-v{latest}"
    - "idea-validation-v{latest}"
    - "product-brief-v{latest}"
    - "brand-guidelines-v{latest}"
    - "prd-v{latest}"
  cold_file_reads:
    - "_context/design/brand-guidelines-v{latest}.md"
  existence_checks:
    - "personas-v{latest} exists"
    - "brand-guidelines-v{latest} exists"
outputs:
  - artifact: "Narrative"
    location: "_context/design/narrative-v{N}.md"
    format: "markdown"
    sacred: false
    distillate: true
    schema: "schemas/design/narrative.schema.json"
  - artifact: "Narrative sidecar"
    location: "_context/design/narrative-v{N}.meta.json"
    format: "json"
version: "1.0"
---

## Purpose

Phase 5 — produce the canonical narrative artefact: product story, persona scenarios, value-prop narrative, brand-voice samples. Thin wrapper around `skills/creative/storytelling/` (which is the cross-cutting source — phases [2, 5, 8, 11]). Per Q5 hybrid resolution: keep the creative skill cross-cutting; Phase 5 owns this thin wrapper that frames inputs and lands the artefact in `_context/design/`.

NOT a duplicate of storytelling — this skill PASSES inputs through to storytelling and CAPTURES outputs into a Phase-5-shaped distillate location.

## When to Use

- "create narrative"
- "narrative"
- Phase 5 — invoked AFTER `brand-guidelines` is validated (needs voice samples). Skip if `archetype-mode == vibe-coder-lean`.

## Prerequisites

- `personas-v{latest}.md` exists (Phase 2 distillate)
- `brand-guidelines-v{latest}.md` exists (Phase 5; provides voice context)

## Process

4-step guided workflow. Step 0 graph-first. Step 2 delegates to creative `storytelling`.

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/design/narrative-v{N}.md` — narrative validated-distillate covering:
- Product story (origin / motivation / North Star arc)
- Persona scenarios (one per primary persona × representative-day vignette)
- Value-prop narrative (the elevator-pitch story)
- Brand-voice samples (excerpts grounded in brand-guidelines voice traits)

Schema-validated. Versioned. Regeneratable from personas + brand-guidelines + idea-validation + product-brief.

## Cross-cutting wire-ins

- `editorial-prose` — Step 3 finalisation (narrative prose polish)
- delegates to `skills/creative/storytelling` — Step 2 authoring core

## Method playbook

`story_types` heavy — narrative work is this skill's domain. Types from data/methods/story-types.csv (subset relevant to Phase 5: origin_story, persona_scenario, value_prop_narrative, brand_voice_samples, feature_story).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-30 | Butler (autonomous queue unit #3 Wave 5.6) | Initial `narrative` skill — NEW under Shape A. Resolves deep-dive finding B23 (storytelling phase tag) + Q5 (hybrid: cross-cutting creative + Phase-5 wrapper). Thin wrapper — most logic delegates to `skills/creative/storytelling/`. Wraps to: frame inputs (persona × value prop × brand-voice context), invoke creative skill, land artefact at `_context/design/narrative-v{N}.md` (validated-distillate). 4-step workflow. editorial-prose wire-in at Step 3. story_types method types: origin_story, persona_scenario, value_prop_narrative, brand_voice_samples, feature_story. |
