---
name: "design-brief"
description: "Phase 5 entry skill — converts PRD + product-brief + personas + baselines into a comprehensive design brief covering content strategy, visual direction, platform/a11y requirements. Step 0 absorbs entry-sync (graph-first context + bridge-mode confirm + brownfield-UI flag + design-deltas log init)."
type: "workflow"
category: "lifecycle"
phase: 5
agent: "ux-designer"
inputs:
  graph_queries:
    - "prd-v{latest}"
    - "product-brief-v{latest}"
    - "personas-v{latest}"
    - "idea-validation-v{latest}"
    - "context-md"
    - "tech-stack-md"
    - "coldpress-yaml-baselines"
    - "archetype-mode"
    - "legacy-input"
  cold_file_reads:
    - "_context/handoffs/phase-4-to-5-{date}.md"
  existence_checks:
    - "prd-v{latest}.locked == true"
    - "personas-v{latest} exists"
    - "tech-stack-md.locked == true"
outputs:
  - artifact: "Design Brief"
    location: "_context/planning/design-brief-v{N}.md"
    format: "markdown"
    sacred: false
    distillate: true
    schema: "schemas/design/design-brief.schema.json"
  - artifact: "Design Brief sidecar"
    location: "_context/planning/design-brief-v{N}.meta.json"
    format: "json"
  - artifact: "Design-deltas WIP log"
    location: "_context/handoffs/phase-5-design-deltas-wip-{date}.md"
    format: "markdown"
    note: "Initialised at Step 0; aggregated into phase-5-to-6 handoff at Phase 5 exit"
version: "2.0"
---

## Purpose

Phase 5 entry skill. Takes the locked PRD from Phase 4 plus Phase 2 personas + Phase 3 baselines and produces the foundational design brief — content strategy, visual direction, platform/a11y requirements — that downstream Phase 5 skills (`ux-design`, `brand-guidelines`, `prototype`, `legacy-ui-assessment`, and ad-hoc `skills/creative/storytelling` narrative work) read as graph input.

Under Shape A, `design-brief` runs in **bridge mode only** at Phase 5 entry: PRD is locked (Phase 4 exit), product-brief-v{N} exists (Phase 2 distillate), personas exist (Phase 2). Standalone mode is removed — design-first archetypes invoke a different entry path pre-Phase-2 (out of scope for Phase 5).

Step 0 absorbs the entry-sync work that would otherwise need a separate `design-entry-sync` skill: graph-first context load, graph-staleness check (4th consumer of helper), bridge-mode confirmation via graph (NOT file-glob — fixes finding B2), brownfield-UI detection (sets flag for `legacy-ui-assessment` trigger), and design-deltas WIP log initialisation.

## When to Use

- "create design brief"
- "design brief"
- Phase 5 entry — invoked automatically as the first Phase 5 skill after `phase-transition` writes phase-4-to-5 handoff.

## Prerequisites

- PRD locked (Phase 4 gate `prd-locked == pass`)
- `personas-v{latest}.md` present
- `tech-stack.md` sacred + locked
- `coldpress.yaml baselines:` declared with a11y axis
- `phase-4-to-5-{date}.md` handoff log written

## Process

5-step guided workflow. Step 0 is graph-first context load (NEW — absorbs entry-sync).

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/planning/design-brief-v{N}.md` — comprehensive design brief covering content strategy, brand voice, visual direction, design-token foundation references (final tokens land in `brand-guidelines-v{N}.md`), platform/responsive strategy, accessibility requirements grounded in active a11y baseline.

Validated-distillate: regeneratable from PRD + product-brief + personas + baselines. Schema-validated. Versioned.

## Design-deltas

If `design-brief` content surfaces a PRD-amendment implication (e.g., brand voice analysis reveals a missing persona segment, or content strategy reveals a feature scope gap), the skill emits a `design_delta` entry into `_context/handoffs/phase-5-design-deltas-wip-{date}.md`. Aggregated at Phase 5 exit by `phase-transition` for reconciliation. See `schemas/handoffs/design-delta.schema.json`.

## Cross-cutting wire-ins

- `editorial-prose` — Step 4 finalisation (voice/tone polish)
- `editorial-structure` — Step 4 finalisation (brief structure check)
- `advanced-elicitation` — wired Tier-1 at vague-style triggers (Step 2 vague_voice, Step 3 vague_visual_direction, Step 4 vague_platform_constraints)

## Method playbook

Reads `data/methods/method-defaults.yaml phase_5:` section. Heavy bias toward `design_thinking` (empathize/define stages), `brainstorming` (round_robin, what_if_mashup), `advanced_elicitation`. Tier-1 wire-ins per workflow.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-30 | Butler (under autonomous queue unit #3 Wave 5.2) | Phase 5 rewrite. Inputs block converted from flat file-list to graph-first structure (`graph_queries` + `cold_file_reads` + `existence_checks` per deep-dive §7b.1). Step 0 added (NEW) — absorbs entry-sync work per Q1 resolution. Bridge-mode default-only (Shape A removes standalone toggle); confirm via graph node not glob (fixes B2). Inputs expanded to include PRD, personas, idea-validation, tech-stack, baselines, archetype-mode, legacy-input (fixes B3, B4). Outputs upgraded to validated-distillate with schema. design-deltas WIP log initialised at Step 0; aggregated by phase-transition at Phase 5 exit. Cross-cutting wire-ins documented. Phase tag bumped 4→5. Folder relocated to `lifecycle/5-design/design-brief/` (Wave 5.1 prerequisite move). |
| 1.1 | 2026-04-25 | Cadbury-hq | Phase II Part 4 Wave 1. Operating modes table rewritten: bridge mode is always-active at Phase 4 entry (product-brief-v{N} always present); standalone mode scoped to design-first entry path only. Prerequisites and When-to-Use updated. |
| 1.0 | 2026-04-08 | Alfred | Initial design-brief skill definition |
