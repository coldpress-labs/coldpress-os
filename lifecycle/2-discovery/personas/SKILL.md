---
name: "personas"
description: "User archetypes + journey mapping + accessibility/device/locale targets — UX research artefacts for Phase 3 stack selection and Phase 4 UX design"
type: "workflow"
category: "lifecycle"
phase: 2
agent: "ux-designer"
inputs:
  - "_context/sacred/context.md"
  - "_context/planning/research/ (domain-*, market-*)"
  - "_context/tracking/intake-{date}.md"
  - ".coldpress/local-config.yaml (for project_shape)"
  - ".coldpress/graph/graph.json (query _input/raw/ for user-research material)"
  - "data/methods/design-thinking-methods.csv (empathize phase)"
  - "data/methods/innovation-frameworks.csv (Jobs to be Done)"
outputs:
  - artifact: "Personas + Journey Maps + Accessibility Targets"
    location: "_context/planning/research/personas-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Produces user archetypes, journey maps, and accessibility/device/locale targets for the product. These artefacts feed two downstream phases directly:

- **Phase 3 stack selection:** offline-first requirements, accessibility standards (WCAG levels), device matrices, language/locale support all hinge on persona needs. Without personas, stack decisions pick for "nobody specific."
- **Phase 4 UX design:** `@ux-designer`'s `create-ux-design` skill consumes personas as its primary input. Clean handoff because the same subagent authors both.

Personas differ from `intake`'s Users step (Phase 1) by degree of rigour: that step captures rough audience shape; `personas` applies discipline-specific research methods (user interviews, empathy mapping, journey mapping, diary studies, jobs-to-be-done) to produce archetypes solid enough to drive design decisions.

## When to Use

- "personas"
- "user research"
- "journey map"
- When Phase 3 needs accessibility / device / locale targets
- When Phase 4 UX design needs user archetypes as input
- After Phase 1 `intake` has established basic audience shape but before Phase 3 stack evaluation

## Prerequisites

- `_context/sacred/context.md` with `status: authored` (Phase 1 `intake` ran)
- At least one of `_context/planning/research/domain-*.md` or `market-*.md` (market signal for audience segments)
- Web access for secondary research if no prior user-research material landed in `_input/`

## Tier 1 — Core methods wired in

Per Phase II deep-dive v1.4 §Tier 1, these methods are mandatory (not optional via router invocation):

| Step | Core methods | Source CSV |
|---|---|---|
| Step 1 — Archetype extraction | **User Interviews**, **Empathy Mapping**, **Jobs to be Done** | `data/methods/design-thinking-methods.csv` (empathize) + `data/methods/innovation-frameworks.csv` (disruption) |
| Step 2 — Journey mapping | **Journey Mapping**, **Diary Studies** | `data/methods/design-thinking-methods.csv` (empathize) |
| Step 4 — Synthesise | **Affinity Clustering** | `data/methods/design-thinking-methods.csv` (define) |

Personas without these methods isn't really doing personas — `@ux-designer` applies them directly, not as optional add-ons.

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A single markdown document at `_context/planning/research/personas-{date}.md` containing:
- 2-3 archetype profiles (name, demographics, goals, pain points, jobs-to-be-done, quote)
- 1 journey map per primary archetype (stages, touchpoints, emotions, pain points, opportunities)
- Accessibility, device, and locale targets with rationale
- Primary archetype flagged (the one Phase 4 UX should optimise for first)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial personas skill per Phase II Part 2 Wave 2.1. `@ux-designer` as primary agent (decision 2026-04-24 — canonical UX research artefacts; clean handoff to Phase 4 `create-ux-design`). Tier 1 methods wired into Steps 1, 2, 4 — User Interviews + Empathy Mapping + JTBD (archetype), Journey Mapping + Diary Studies (journey), Affinity Clustering (synthesis). Method citations reference `data/methods/design-thinking-methods.csv` and `data/methods/innovation-frameworks.csv`. |
