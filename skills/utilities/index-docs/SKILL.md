---
name: "index-docs"
description: "Generate or update an index.md for all documents in a folder"
type: "simple"
category: "utilities"
status: "wire-in-phase-1"
phases: [1, 4, 5, 8]
inputs:
  - "target directory to index"
outputs:
  - artifact: "Index File"
    location: "{target-directory}/index.md"
    format: "markdown"
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

1. **Scan target directory.** List all files, grouping by type / subdir.

   **Graph-first path (preferred when a graph exists).** Before globbing the filesystem, try:

   ```bash
   coldpress graph query --dir-role <matching-role> --format json
   ```

   For common targets:
   - Indexing `_context/planning/` → `--dir-role _context/planning`
   - Indexing `_context/sacred/` → `--node-type SacredDoc`
   - Indexing all `_context/*` → loop over the 8 `_context/*` dir_roles
   - Indexing `_input/*` → `--node-type Input`

   Parse the JSON. On exit code `0`, use `data[].source_file` + `data[].label` — every hit already carries enriched metadata (`coldpress.node_type`, `coldpress.env_tag`, community id) you'd otherwise have to re-derive from the file. Writes to disk still happen against the real filesystem; the graph just saves you a scan.

   On exit code `2` (no graph yet), fall back to the direct-read path below. On exit code `1`, surface the error — don't guess at the file set.

   **Direct-read fallback** (original behaviour when graph is absent):
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
