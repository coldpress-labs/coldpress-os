---
name: parse-document
description: Parse a PDF / Office / image / HTML file into markdown for graph indexing
license: MIT
compatibility: Invoked by @analyst in Phase 2
version: "1.0"
---

## Purpose

Convert a raw document — PDF, DOCX, PPTX, XLSX, image, HTML, or AI conversation export — into clean markdown that Graphify can index. Routes between three backends:

- **Fast path — markitdown (Microsoft, MIT):** text-native PDFs, simple Office files, HTML. Near-zero ML weight, near-instant startup.
- **Accurate path — Docling (IBM, MIT):** scanned PDFs, complex tables, images, layout-sensitive content. Downloads ~500MB–1GB of ML models on first use.
- **AI conversation path — stdlib-only:** ChatGPT / Claude / generic AI conversation exports (JSON or markdown). Detected by content sniff, not extension — the adapter preserves turn structure (`## Turn N — User / Assistant`) and renders tool-use blocks as fenced code so Graphify clusters turns as distinct nodes instead of one mega-blob.

Output markdown lives at `_input/.parsed/<original-filename>.md` so Graphify picks it up on the next `coldpress graph rebuild` pass without any manual bookkeeping.

## When to Use

- "ingest this PDF / DOCX / image"
- "parse the brief in `_input/raw/`"
- As part of `@analyst`'s Phase-2 Discovery workflow when raw documents land in `_input/`
- Before `coldpress graph rebuild` so the graph indexer has parsed prose to work with

## Prerequisites

- **Python ≥ 3.10** on PATH. Verify: `python3 --version`.
- **Markitdown** installed: `pip install markitdown`.
- **Docling** installed: `pip install docling` (first invocation downloads ML models — up to 1GB, one-time).

If Python or either adapter is missing, the Node entry surfaces a clear install hint and exits non-zero — the skill does not silently skip.

## Process

1. **Invoke the Node entry** from the project root:

   ```bash
   node coldpress-os/skills/ingest/parse-document/scripts/parse.mjs <input-path>
   ```

   Optional flags:
   - `--backend <markitdown|docling>` — force one backend (skip the heuristic).
   - `--output <path>` — override output path (default: `_input/.parsed/<name>.md`).
   - `--force` — overwrite an existing output file.

2. **The routing heuristic** (unless `--backend` is forced):
   - `.pdf` → markitdown first, fall back to Docling if the output is suspiciously short (< 200 chars) or empty.
   - `.docx`, `.pptx`, `.xlsx` → markitdown.
   - `.png`, `.jpg`, `.jpeg`, `.tiff`, `.bmp` → Docling (OCR needed).
   - `.html`, `.htm` → markitdown.
   - `.json` → `ai_conversation` if the head sniffs as a conversation (top-level `messages[]` with `role` fields, or a top-level array of messages); otherwise unsupported.
   - `.md`, `.markdown` → `ai_conversation` if the head contains both a `User` / `Human` heading and an `Assistant` / `Claude` / `ChatGPT` heading at level 2-4; otherwise passthrough.
   - `.txt` → passthrough copy (no parsing).
   - Other extensions → error with a list of supported formats.

3. **Execute the adapter** as a Python subprocess from the Node wrapper. Stdout is the generated markdown; stderr carries logs. Exit 0 on success, non-zero with a clear message on failure.

4. **Write the output** to `_input/.parsed/<name>.md` (directory auto-created). Skip if the destination exists unless `--force` is set.

5. **Report** the backend used, the input path, the output path, and the output size. The Analyst (or user) reviews the markdown for ingest quality before the next `coldpress graph rebuild`.

## Licence hygiene

Coldpress-os wraps only MIT / Apache-2.0 document-processing libraries. Copyleft-licensed alternatives (Marker GPL-3, PyMuPDF AGPL-3, Surya GPL-3, Unstructured Apache-2.0-but-heavy-deps) are on the **hard blocklist** — wrap-via-user-install would technically be legally permissible (shelling out is not distribution) but creates grey zones at scale. See `docs/anthropic-skill-wrapping-audit.md` §Ingest for the full table.

## Output

One markdown file at `_input/.parsed/<original-filename>.md`. Preserves relative path structure when the input lives under a subfolder of `_input/` (e.g., `_input/raw/briefs/q2-plan.pdf` → `_input/.parsed/raw/briefs/q2-plan.md`).

## Example

```bash
# Before: _input/raw/stakeholder-interview.pdf (scanned)
node coldpress-os/skills/ingest/parse-document/scripts/parse.mjs _input/raw/stakeholder-interview.pdf

# Output:
# ▸ backend: docling (fell back from markitdown — output was < 200 chars)
# ▸ input:   _input/raw/stakeholder-interview.pdf (1.2 MB)
# ▸ output:  _input/.parsed/raw/stakeholder-interview.md (14 KB)
# ▸ run `coldpress graph rebuild` to index.
```

## Failure modes

- **Python not on PATH:** skill aborts with install hint.
- **Adapter library missing:** skill aborts with the exact `pip install` command.
- **Input file not found / unreadable:** skill exits 1 with path.
- **Unsupported extension:** skill exits 1 with the list of supported formats.
- **Output file exists (no `--force`):** skill exits 1 with the `--force` hint.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-23 | Cadbury-hq | Initial parse-document skill — dual-backend routing (markitdown / Docling), Python subprocess runtime, MIT-only licence stance. Produced as part of Wave 3 Block Q (§3.9). |
