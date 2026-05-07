---
step_number: 1
step_name: "Material solicitation"
step_goal: "Walk the user through the 5 _input/ subfolders; ingest anything they've already prepared"
halts_for_input: true
next_step: "step-02-shape-determination.md"
re_entry: "allowed"
---

## Goal

Before Butler asks the user to *describe* the project, offer a chance to *show* it. Many projects start life as a folder of briefs, past decks, AI conversations, or vendor SDKs — those carry more signal than a whiteboard summary.

## Instructions

### 1. Mark partial completion

```ts
await markStepStart(projectRoot, "intake/step-01-material-solicitation");
```

### 2. Walk the 5 `_input/` subfolders, one at a time

For each of `assets/`, `vendor/`, `raw/`, `legacy/`, `reference/`:

- Tell the user what the folder is for (read the first line of each folder's `README.md`).
- Ask: *"Do you have any `{folder}` material you'd like me to ingest?"*
- If **yes**: prompt for paths or drag-and-drop; move the files into the folder; log what landed in the intake report.
- If **no**: create an empty marker at `_input/{folder}/.intake-skip` so the Phase 1 gate doesn't flag the folder as unintentionally empty.
- If **URLs**: inline sub-routine — WebFetch each URL and save to `_input/reference/{slug}.md`. Log fetched URLs + titles.

### 3. Shard large files (> 50 KB)

After each file lands, check its size. If any file in `_input/raw/` exceeds ~50 KB (common for AI conversation exports), invoke the `shard-doc` utility skill on it. This breaks it into chunks the graph will cluster cleanly instead of producing a single mega-node.

### 4. Index the material (`index-docs`)

Once all folders are walked, invoke the `index-docs` utility skill to generate `_input/INDEX.md`. This gives Butler a cheap retrieval target for Phase 2+ skills without re-walking the tree each time.

### 5. Append to the intake report

```markdown
## Material inventory ({date})

### _input/assets/
- <filename> — <brief type / source>

### _input/vendor/
- ...

### _input/raw/
- <filename> (<size>, sharded into N chunks)
- ...

### _input/legacy/
- ...

### _input/reference/
- <filename> — fetched from <url>
```

### 6. Clean exit

```ts
await clearStepMarker(projectRoot);
```

## Halts for Input

Yes — one prompt per folder (can Butler ingest?). On re-run from a later phase, only prompts for new material; existing subfolder contents are preserved.

## Navigation

→ `step-02-shape-determination.md` (on fresh intake)
→ Back to Butler (on re-run from an active phase — Steps 2-6 skipped)
