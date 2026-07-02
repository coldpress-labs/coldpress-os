---
name: docx-generator
description: Emit Word .docx documents from coldpress-os markdown sources. Uses pandoc or `docx` npm package. Targets client-archetype deliverables that must be editable in Word (vs PDF read-only). Preserves heading hierarchy → Word styles, embedded images, tables.
license: MIT
compatibility: Invoked by @butler in Phase 4
version: "1.0"
---

## Purpose

Emit a Word .docx from a coldpress-os markdown source. Two-engine support: **pandoc** (CLI; canonical for markdown→docx; preserves headings, tables, images, footnotes) or **`docx` npm package** (programmatic; for cases where caller needs custom styling or structured input). Pandoc default — invokes via subprocess.

Use case: client-archetype deliverables where the client must edit the document (PRD, design-brief, retrospective). PDF is read-only; DOCX is editable. Same source markdown can emit both.

## When to Use (Proactive Triggers)

1. User says "export PRD as Word doc" / "give me the editable version" / "DOCX deliverable for client review"
2. Phase 4/5 client-archetype final deliverable
3. Phase 11 retrospective for stakeholder review (when stakeholder uses Word)
4. Cross-tool collaboration (legal review / client compliance review)

## Output Artifacts

1. **Source DOCX** at `_context/exports/<source-slug>-v{N}.docx` — Word-compatible, heading hierarchy → Heading 1/2/3 styles, code blocks → Courier monospace, tables → Word tables
2. **Reference style file** (optional) — `templates/documents/word-reference.docx` for custom corporate style; pandoc `--reference-doc=...` flag

## Prerequisites

- Source markdown file path passed by caller
- For pandoc engine: `pandoc` binary on PATH (preferred)
- For docx npm engine: `docx` package in dev-deps + structured input
- For corporate styling: optional `templates/documents/word-reference.docx` (Word file with style definitions)

## Process

1. **Detect engine** — pandoc if available (preferred); fall back to `docx` npm
2. **Pandoc invocation:**
   ```bash
   pandoc input.md \
     --from markdown \
     --to docx \
     --output _context/exports/<slug>-v{N}.docx \
     [--reference-doc=templates/documents/word-reference.docx] \
     --toc \
     --table-of-contents
   ```
3. **For programmatic engine (docx npm):** structured input → `Document` → `Packer.toBuffer()` → file write
4. **Verify output** — file exists, non-zero size, parseable as ZIP (DOCX is ZIP-of-XML)
5. **Emit** to `_context/exports/<slug>-v{N}.docx`

## Activation-Gate Checklist

- [ ] Source markdown file exists + readable
- [ ] Engine available (pandoc OR docx npm)
- [ ] Output file emitted, non-zero size
- [ ] ZIP integrity verified (DOCX is structured ZIP)
- [ ] Heading hierarchy preserved (visual spot-check on first 3 H1/H2/H3)
- [ ] Reference style applied (if specified)

## Output

DOCX file at `_context/exports/<slug>-v{N}.docx`. Pairs with `pdf-generator` (same source → both formats); ingestion via `parse-document` (already exists).

## Source Attribution

Pattern adapted from `anthropics/skills` (no license — REFERENCE ONLY) `docx` skill. Implementation original to coldpress-os; pandoc-primary engine choice + integration with existing `parse-document` skill.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U15b) | Initial docx-generator skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from anthropics/skills (reference only — no vendoring). |
