---
name: "shard-doc"
description: "Split large markdown documents into smaller organized files by section"
type: "simple"
category: "utilities"
status: "wire-in-phase-4"
phases: [2, 4, 5, 8]
inputs:
  - "source markdown document to split"
outputs:
  - artifact: "Sharded Files"
    location: "{source-directory}/{source-name}/"
    format: "markdown"
version: "1.0"
---

## Purpose

Splits a large monolithic markdown document into smaller, organized files based on level-2 headings. Creates a directory with individual section files and an index for navigation.

## When to Use

- "shard this document"
- "split this doc into sections"
- "break this file up"
- When a document exceeds ~500 lines and becomes hard to navigate
- When different sections need independent editing or version tracking
- When converting monolithic docs to a sharded format for coldpress-os consumption

## Prerequisites

- Source document must be a markdown file
- Document must have level-2 headings (`##`) that define logical sections

## Process

1. **Read the source document** and identify all level-2 sections.

2. **Split by section.** For each `##` heading:
   - Create a file named from the heading (kebab-case, e.g., `## Design Principles` → `design-principles.md`)
   - Include the heading and all content until the next `##`
   - Preserve any frontmatter from the original in each shard (if relevant)

3. **Create index file** (`index.md` or `_index.md`) listing all shards with:
   - Link to each shard file
   - One-line description extracted from the first sentence of each section

4. **Verify completeness.** Ensure all content from the original is accounted for in the shards. Nothing dropped.

5. **Report results** to user:
   - Number of shards created
   - File listing with sizes
   - Location of index file

6. **Ask about original.** Present options:
   - **(D) Delete** original file
   - **(M) Move** original to an archive location
   - **(K) Keep** original alongside shards

## Output

A directory of sharded markdown files plus an index file. Original document optionally archived or removed.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-shard-doc, adapted to coldpress-os schema |
