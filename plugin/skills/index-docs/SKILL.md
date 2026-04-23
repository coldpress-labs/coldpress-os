---
name: index-docs
description: Generate or update an index.md for all documents in a folder
license: MIT
compatibility: Phase 4
version: "1.0"
---

## Purpose

Scans a directory and generates a comprehensive `index.md` file listing all documents with descriptions, organized by type. Keeps documentation navigable as projects grow.

## When to Use

- "index this folder"
- "create an index for docs"
- "update the index"
- After adding new documents to a folder
- When documentation has grown and needs a navigation aid
- As part of documentation cleanup or restructuring

## Prerequisites

- Target directory must exist and contain files
- Files should be readable (markdown, text, or code files)

## Process

1. **Scan target directory.** List all files, grouping by:
   - File type (markdown, YAML, CSV, code, etc.)
   - Subdirectories (with recursive option)

2. **Read each file** to extract:
   - Title (from first heading or filename)
   - Description (from frontmatter `description` field, or first meaningful sentence)
   - Last modified date

3. **Generate index.md** with:
   - Directory overview
   - Organized file listings by type or subdirectory
   - Relative links to each file
   - One-line descriptions
   - Last updated timestamp

4. **If index.md already exists,** update it rather than replacing — preserve any manually added content or annotations.

5. **Present the generated index** to user before writing.

## Output

An `index.md` file at the root of the target directory with organized, linked listings of all contents.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-index-docs, adapted to coldpress-os schema |
