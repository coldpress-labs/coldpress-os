---
name: "pdf-deep-parser"
description: "Deep analysis and structured extraction of PDF documents"
type: "simple"
category: "utilities"
status: "ad-hoc"
phases: [2, 4, 8]
inputs:
  - "PDF file to analyze"
outputs:
  - artifact: "Extracted Content"
    location: "_input/.parsed/{pdf-name}-extracted.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Performs deep analysis of PDF documents using native PDF ingestion, extracting structured data into organized markdown or JSON. Handles complex layouts including tables, multi-column text, embedded images, and hierarchical headings.

## When to Use

- "parse this PDF"
- "extract data from PDF"
- "analyze this PDF"
- When onboarding reference material from PDF format
- When extracting requirements or specifications from client PDFs
- When converting PDF documentation to markdown for project use

## Prerequisites

- PDF file must be accessible at a valid path
- File must be a readable PDF (not scanned image-only without OCR)

## Process

1. **Ingest the PDF** using native file reading. Read the full document to understand overall structure before extracting.

2. **Identify document structure:**
   - Headings and hierarchy
   - Tables and their schemas
   - Lists (ordered and unordered)
   - Code blocks or technical content
   - Images and captions
   - Page headers/footers (to exclude from content)

3. **Full context scan.** Read the entire document before beginning extraction to understand:
   - Document purpose and type
   - Terminology and conventions
   - Cross-references between sections

4. **Extract to structured format:**
   - Convert headings to markdown hierarchy
   - Convert tables to markdown tables
   - Preserve list structures
   - Note image locations with descriptive placeholders
   - Maintain cross-references as markdown links

5. **Verify against native layout.** Compare extracted content against the original PDF structure to ensure nothing was missed or misformatted.

6. **Present extraction** to user with:
   - Summary of what was extracted
   - Any sections that were ambiguous or low-confidence
   - Options for output format (markdown, JSON, or both)

## Output

A structured markdown file containing the extracted PDF content, organized by the document's original hierarchy.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from pdf-deep-parser, adapted to coldpress-os schema |
