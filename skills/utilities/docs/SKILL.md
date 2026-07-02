---
name: "docs"
description: "Document utilities toolbox — op: distill (lossless LLM-optimized compression), shard (split a large markdown doc into section files), or index (generate/update a folder index.md). Select with the op parameter."
type: "simple"
category: "utilities"
status: "wire-in-phase-1 wire-in-phase-2 wire-in-phase-3"
phases: [1, 2, 3, 4, 5, 6, 8]
inputs:
  - "op: distill | shard | index"
  - "source document(s), file, or target directory (per op)"
outputs:
  - artifact: "Distillate (op: distill)"
    location: "_context/planning/distillates/{source-name}-distillate.md"
    format: "markdown"
  - artifact: "Sharded Files (op: shard)"
    location: "{source-directory}/{source-name}/"
    format: "markdown"
  - artifact: "Index File (op: index)"
    location: "{target-directory}/index.md"
    format: "markdown"
version: "2.0"
---

## Purpose

Three complementary document utilities behind one skill, selected by `op`:

- **`distill`** — lossless LLM-optimized compression of source documents into dense distillates (every fact, decision, constraint, relationship preserved; maximum information density).
- **`shard`** — split a large monolithic markdown document into smaller section files (by `##` heading) plus a navigation index.
- **`index`** — scan a folder and generate/update an `index.md` listing all documents with descriptions, keeping docs navigable as a project grows.

## When to Use

- "distill / compress this document" → `op: distill`
- "shard / split this doc into sections" → `op: shard`
- "index this folder / update the index" → `op: index`

## Prerequisites

- `op` — one of `distill | shard | index` (infer from the request when unambiguous).
- Op-specific input: source document(s) (distill), a markdown file with `##` headings (shard), or a target directory (index).

## Process

### op: distill

1. **Receive and analyze source(s):** single vs multiple; document type; approximate token count; whether splitting is needed (>5K tokens → consider fan-out).
2. **Apply compression rules.**
   - **Strip:** transitional phrases, rhetorical questions/filler, self-referential meta-text, common knowledge, hedging.
   - **Preserve (never remove):** numbers/dates/measurements/thresholds; named entities (people, systems, APIs, tools); decisions + rationale; constraints/requirements; relationships/dependencies.
   - **Transform:** prose → dense bullets; "handle auth using JWT tokens" → "Auth: JWT"; verbose conditionals → compact if/then.
   - **Deduplicate:** keep one instance of repeated info; note source conflicts explicitly.
3. **For >5K-token docs,** apply semantic splitting: a root distillate (orientation + cross-cutting) plus self-contained section distillates (3K–5K tokens each).
4. **Format output** with frontmatter: `source`, `distilled`, `token_estimate`, `compression_ratio`.
5. **Validate** — mentally reconstruct the source from the distillate; if any fact can't be recovered, add it back (compression must be lossless).

### op: shard

1. **Read the source** and identify all level-2 (`##`) sections.
2. **Split by section:** one kebab-case file per `## heading` (`## Design Principles` → `design-principles.md`), heading + content until the next `##`; preserve relevant frontmatter per shard.
3. **Create an index** (`index.md`) linking each shard with a one-line description (first sentence of the section).
4. **Verify completeness** — all original content accounted for; nothing dropped.
5. **Report** shard count + file listing/sizes + index location.
6. **Ask about the original:** (D)elete / (M)ove to archive / (K)eep alongside shards.

### op: index

1. **Scan the target directory** — list files grouped by type/subdir (markdown, YAML, CSV, code…); recursive option.
2. **Read each file** to extract title (first heading or filename), description (frontmatter `description` or first meaningful sentence), last-modified date.
3. **Generate `index.md`:** directory overview; listings organized by type/subdir; relative links; one-line descriptions; last-updated timestamp.
4. **If `index.md` exists,** update it rather than replacing — preserve manually-added content/annotations.
5. **Present** the generated index before writing.

## Output

Per op: a distillate file with metadata frontmatter (distill); a directory of section files + index, original optionally archived (shard); an `index.md` with organized linked listings (index).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-07-02 | Butler (v0.4 WS5-B) | Merged `distillator` + `shard-doc` + `index-docs` → one `docs` toolbox with an `op: distill\|shard\|index` parameter (the §2.4 doc-generation-overlap cluster). Each process preserved verbatim. Union of wire-ins (phase-1/2/3) and phases [1,2,3,4,5,6,8]. Dropped `index-docs`' stale `coldpress graph query` path (that verb was deleted in WS0 §8 item 1) — the direct-filesystem scan is now the only path. `document-project` stays separate (§5 P10 keeps it atomic). Canonical-count reduction (3 → 1). |
| 1.0 | 2026-04-08 | Alfred | (as `distillator` + `shard-doc` + `index-docs`) Migrated from bmad-{distillator,shard-doc,index-docs}, adapted to coldpress-os schema. |
