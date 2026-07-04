---
name: "pdf-generator"
description: "Emit PDF documents from coldpress-os artefacts (PRD / architecture.md / retrospective / design-brief / etc.). Markdown-source primary; supports custom layouts via CSS @page rules. Pairs with `parse-document` (ingest side); together they form the document round-trip for Phase 4 / 5 / 11 deliverables."
type: "simple"
category: "creative"
agent: "butler"
phases: [4, 5, 8, 10, 11]
license: "MIT"
version: "1.0"
updated: "2026-05-03"
inputs:
  graph_queries:
    - "source artefact (sacred-doc or validated-distillate by id)"
  cold_file_reads:
    - "source markdown file (path passed by caller)"
    - "authoring/documents/<doc-type>.md (style hints)"
  existence_checks:
    - "source markdown file exists"
outputs:
  - artifact: "PDF"
    location: "_context/exports/<source-slug>-v{N}.pdf"
    format: "pdf"
    sacred: false
---

## Purpose

Emit a presentation-quality PDF from a coldpress-os markdown source artefact. Two-engine support: **`@react-pdf/renderer`** (programmatic, when fine-grained layout control needed) or **headless Chromium via Puppeteer/Playwright** (when CSS @page rules + print-stylesheet handle the work).

Default to Chromium-based render: it handles complex CSS, embedded fonts, page-breaks, headers/footers via CSS @page. React-PDF for cases where the source is structured data (e.g., schema-driven reports) rather than authored markdown.

## When to Use (Proactive Triggers)

1. User says "export PRD as PDF" / "generate the architecture PDF" / "make a deliverable PDF of the retrospective"
2. Phase 4/5 client-archetype deliverable (formal client-facing PRD or design-brief PDF)
3. Phase 11 retrospective publishing (archive-quality PDF for record)
4. Pre-deployment release notes deliverable (Phase 9)

## Output Artifacts

1. **Source PDF** at `_context/exports/<source-slug>-v{N}.pdf` — print-quality, embedded fonts, A4 default (US-letter optional)
2. **Cover page** (auto-generated when source has frontmatter title + author + date) — first page of PDF
3. **Table of contents** (auto-generated from `##` heading structure when ≥3 H2s exist)
4. **Embedded font subset** (only used glyphs for size optimisation)

## Prerequisites

- Source markdown file path passed by caller
- For Chromium engine: Playwright or Puppeteer in dev-deps; Chromium binary present
- For React-PDF engine: `@react-pdf/renderer` + structured data input
- For embedded fonts: font files present (or fallback to system fonts)

## Process

1. **Detect engine** — Chromium if source is markdown; React-PDF if source is structured (JSON/YAML)
2. **Markdown → HTML** via remark/marked with custom CSS @page rules:
   ```css
   @page {
     size: A4;
     margin: 20mm 15mm 25mm 15mm;
     @top-center { content: "<title>"; }
     @bottom-right { content: "Page " counter(page) " of " counter(pages); }
   }
   ```
3. **Render via Chromium** — `await page.pdf({ format: 'A4', printBackground: true })`
4. **Embed font subset** — use `fontkit` to subset; reduces file size 60-90%
5. **Emit** to `_context/exports/<slug>-v{N}.pdf`; bump `{N}` if prior version exists

## Activation-Gate Checklist

- [ ] Source markdown file exists + readable
- [ ] Engine selected (Chromium / React-PDF) per source type
- [ ] Cover + TOC auto-generated (if applicable)
- [ ] Font subset embedded (or system-font fallback documented)
- [ ] Emit path versioned (no overwrite of prior PDF)
- [ ] PDF valid (passes pdfinfo / mutool clean)

## Output

PDF file at `_context/exports/<slug>-v{N}.pdf`. Pairs with `parse-document` (ingest side) for round-trip workflows.

## Source Attribution

Pattern adapted from `anthropics/skills` (no license — REFERENCE ONLY) `pdf` skill. Implementation original to coldpress-os; integrates with existing `parse-document` ingest skill + markdown source artefacts. Do not vendor anthropics/skills code; pattern only.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U15a) | Initial pdf-generator skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from anthropics/skills (reference only — no vendoring). |
