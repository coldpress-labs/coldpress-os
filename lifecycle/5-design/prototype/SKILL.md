---
name: "prototype"
description: "Phase 5 — produce prototype artefacts in archetype-conformant mode. Default: tech-stack-coupled code skeleton (React component shells / Convex schema stubs / etc.). vibe-coder-lean → visual mock spec (Mermaid + state lists). design-led/WDS → clickable HTML reference. Outputs a manifest + mode-conditional artefact files."
type: "workflow"
category: "lifecycle"
phase: 5
agent: "ux-designer"
inputs:
  graph_queries:
    - "prd-v{latest}"
    - "ux-design-spec-v{latest}"
    - "design-brief-v{latest}"
    - "brand-guidelines-v{latest}"
    - "tech-stack-md"
    - "archetype-mode"
  cold_file_reads:
    - "_context/design/ux-design-spec-v{latest}.md"
    - "_context/design/brand-guidelines-v{latest}.md"
  existence_checks:
    - "ux-design-spec-v{latest}.validated == true"
    - "brand-guidelines-v{latest}.validated == true"
    - "tech-stack-md.locked == true"
outputs:
  - artifact: "Prototype artefacts"
    location: "_context/design/prototype/{date}/"
    format: "directory with manifest + mode-conditional files"
    sacred: false
    distillate: false
    schema: "schemas/design/prototype-manifest.schema.json (manifest only)"
version: "1.0"
---

## Purpose

Phase 5 — convert UX design spec + brand-guidelines + tech-stack into tangible prototype artefacts. Output mode is archetype-shaped (Q2 resolution):

| Archetype | Mode | Output shape |
|-----------|------|--------------|
| `vibe-coder-lean` | mock-spec | Mermaid screen diagrams + state lists; stack-agnostic; AI-readable |
| `standard` (default) | code-skeleton | React/Vue/Svelte/etc. component shells + Convex schema stubs (tech-stack-coupled); imports brand-guidelines tokens; embedded comments cite PRD acceptance criteria |
| `design-led` / `WDS` | clickable-html | HTML/CSS prototype with brand-tokens applied; OR external-tool reference (Figma/Penpot link) |

Output is a `_context/design/prototype/{date}/` directory containing a `manifest.json` (schema-validated) plus mode-conditional artefact files. NOT a validated-distillate — manifest is schema'd, but artefact files are tangible deliverables for downstream Phase 6 + Phase 8 reference.

## When to Use

- "create prototype"
- "prototype"
- Phase 5 — invoked AFTER both `ux-design` AND `brand-guidelines` are validated.

## Prerequisites

- `ux-design-spec-v{latest}` validated
- `brand-guidelines-v{latest}` validated
- `tech-stack-md` locked

## Process

5-step guided workflow. Step 0 graph-first. Step 1 mode select. Steps 2-4 mode-conditional content authoring + validation.

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/design/prototype/{date}/`:
- `manifest.json` (schema-validated) — declares `mode`, `archetype_assumed`, `files[]` with role, `tech_stack_imports[]` (verified vs tech-stack), `acceptance_criteria_referenced[]`
- mode-conditional files: 
  - **code-skeleton:** React component shells (.tsx/.vue/.svelte), Convex/db schema stubs, route definitions, type files
  - **mock-spec:** Mermaid `.md` files (one per screen) with state lists
  - **clickable-html:** `index.html` + `style.css` + `tokens.css` + per-screen .html files; OR `external-tool-reference.md` linking to Figma/Penpot

## Cross-cutting wire-ins

- `adversarial-review` — Step 4 validate (challenge prototype edge cases, scope coverage)
- `advanced-elicitation` — Steps 2, 3 (vague_interaction triggers)

## Method playbook

`design_thinking` prototype + test stages (heavy — Steps 2 + 3); `problem-solving` for edge cases.

## Tech-stack imports verification

Step 4 parses every import statement in code-skeleton mode against `tech-stack-md.dependencies`. Imports of libraries NOT in tech-stack surface as design-deltas (`flag_for_architecture_ADR` recommendation; Phase 6 may need to add ADR for the new dependency).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-30 | Butler (autonomous queue unit #3 Wave 5.5) | Initial `prototype` skill — NEW under Shape A. Resolves deep-dive finding B16 (no `prototype` skill existed). Per Q2 resolution: default mode = tech-stack-coupled code-skeleton; archetype-mode branches: vibe-coder-lean → mock-spec; design-led/WDS → clickable-html. Output: directory with manifest.json + mode-conditional artefact files. Manifest schema'd; artefact files tangible deliverables. Tech-stack imports verification at Step 4 (B7 supersede-check pattern). adversarial-review wire-in at Step 4. Templates at authoring/prototype/{mode}/. |
