# `_input/raw/`

**Purpose:** Unstructured written input — the project's starting signal.

Put things like:

- Project briefs, RFPs, initial scopes
- Meeting notes, voice-memo transcripts
- **AI conversation exports** — ChatGPT and Claude session transcripts (JSON or markdown-wrapped). Butler has a dedicated adapter that preserves turn structure when parsing these.
- Emails, Slack threads, Notion page exports
- Drafts, napkin sketches in text form

Butler ingests this during Phase 1 `intake` and builds the initial graph index. Files here seed the Phase 2 Discovery skills (`pre-project-interview`, intent refinement).

**Large files (>50KB)** are auto-sharded by Butler so the graph clusters cleanly rather than producing one mega-node.

**Distinct from:**
- `legacy/` — prior *attempts at this same project* (code, deprecated specs)
- `reference/` — optional inspiration
- `vendor/` — required third-party integration docs
- `assets/` — visual and brand material
