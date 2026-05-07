# `_input/legacy/`

**Purpose:** Prior attempts at *this same project*.

Put things like:

- Old codebases being rewritten
- Deprecated specifications or PRDs
- Previous architecture documents
- Earlier brand guidelines being superseded
- Screenshots of the old UI being replaced

If this folder has content, Butler infers the project is **brownfield** (rewrite/migration) rather than greenfield. This decision is made in Phase 1 `intake` Step 2 (shape determination) and persisted in `.coldpress/local-config.yaml project_shape`.

Phase 4 Planning later reviews these artefacts to decide what's kept, refactored, or left as reference-only scaffolding.

**Distinct from:**
- `raw/` — fresh input for *this* attempt
- `reference/` — inspiration from unrelated projects
- `vendor/` — third-party integration docs
- `assets/` — brand/visual material
