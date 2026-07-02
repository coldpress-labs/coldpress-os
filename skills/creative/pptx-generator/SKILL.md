---
name: "pptx-generator"
description: "Emit PowerPoint .pptx decks from structured input (deck spec / story-arc / slides outline). Uses `pptxgenjs`. Pairs with `presentation` skill (deck authoring) — pptxgenjs is the renderer; presentation builds the structure."
type: "simple"
category: "creative"
agent: "butler"
phases: [4, 10, 11]
license: "MIT"
version: "1.0"
updated: "2026-05-03"
inputs:
  graph_queries:
    - "deck spec node (if invoked from `presentation` skill)"
  cold_file_reads:
    - "deck spec markdown or YAML (path passed by caller)"
    - "_context/design/brand-guidelines-v{latest}.md (token application)"
    - "templates/documents/deck-reference.pptx (optional master)"
  existence_checks:
    - "deck spec source exists"
    - "pptxgenjs in dev-deps"
outputs:
  - artifact: "PPTX"
    location: "_context/exports/<deck-slug>-v{N}.pptx"
    format: "pptx"
    sacred: false
---

## Purpose

Emit a PowerPoint .pptx deck from structured input. Renders via [`pptxgenjs`](https://gitbrent.github.io/PptxGenJS/) (pure-TS; produces standards-compliant Open XML; no Office dependency). Pairs with the `presentation` creative skill: `presentation` plans the deck (slide structure, story-arc, content per slide); this skill renders to .pptx.

Brand-guideline-aware: reads `_context/design/brand-guidelines-v{latest}.md` token values + applies primary/secondary/accent colours + heading/body fonts + corporate logo to every slide. Falls back to neutral defaults if brand-guidelines missing.

## When to Use (Proactive Triggers)

1. User says "export deck" / "make a PowerPoint" / "render the slides"
2. Phase 4 client-archetype pitch deck deliverable
3. Phase 10 sprint-status / monthly-update presentation
4. Phase 11 retrospective summary deck (stakeholder review)
5. After `presentation` skill builds the structure — this skill emits the file

## Output Artifacts

1. **PPTX file** at `_context/exports/<deck-slug>-v{N}.pptx` — Open XML format, opens in PowerPoint / Keynote / Google Slides / LibreOffice
2. **Slide-source mapping** at `_context/exports/<deck-slug>-v{N}.slides.json` — for each rendered slide: source spec ref + applied tokens + layout used
3. **Brand-token application log** — which tokens from brand-guidelines were used; flag any missing (e.g., "no logo SVG found; rendered text-only header")

## Prerequisites

- Deck spec source — markdown with slide-separator (`---` between slides) OR structured YAML/JSON
- `pptxgenjs` package in dev-deps
- `_context/design/brand-guidelines-v{latest}.md` (optional but recommended)
- Corporate logo (optional) — `_input/assets/logo.svg` or `_input/assets/logo.png`

## Process

1. **Parse deck spec** — markdown with `---` separators, OR YAML/JSON structured array
2. **Per slide:**
   - Apply layout (title / content / two-column / image-right / quote / closing) per spec
   - Apply brand tokens (background, heading colour, body colour, accent)
   - Apply font pairing (heading family, body family) from brand-guidelines
   - Render content (text / lists / images / Chart.js charts if data-driven)
3. **Auto-generate** title slide (from frontmatter `title:` + `author:` + `date:`) and closing slide ("Thanks / Q&A / contact")
4. **Render PPTX** via `pres.writeFile({ fileName: '_context/exports/<slug>-v{N}.pptx' })`
5. **Emit slide-source mapping** for audit trail (which spec slide → which rendered slide)

## Activation-Gate Checklist

- [ ] Deck spec parsed; slide count ≥3 (title + content + closing minimum)
- [ ] Brand tokens applied (or fallback documented)
- [ ] Each slide has a layout selected
- [ ] PPTX file emitted, non-zero size
- [ ] Open XML integrity verified (PPTX is structured ZIP)
- [ ] Slide-source mapping JSON written

## Output

PPTX deck at `_context/exports/<slug>-v{N}.pptx` + JSON mapping. Round-trip via `parse-document` (existing) for ingestion of external decks.

## Source Attribution

Pattern adapted from `anthropics/skills` (no license — REFERENCE ONLY) `pptx` skill + `nextlevelbuilder/ui-ux-pro-max-skill` (MIT) `slides` skill (deck-structure + emotion-arc taxonomy). Implementation original to coldpress-os; pptxgenjs renderer + brand-guidelines token integration.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U15c) | Initial pptx-generator skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from anthropics/skills (reference only) + nextlevelbuilder (MIT pattern). |
