---
name: "validate-schema"
description: "Structural validation of sacred-doc frontmatter against per-doc JSON Schemas (Ajv)"
type: "simple"
category: "governance"
agent: "butler"
phases: [1, 3, 4, 5]
tools: ["Bash", "Read"]
inputs:
  - "sacred-doc path (e.g., _context/sacred/prd.md)"
  - "corresponding JSON Schema (auto-resolved by basename)"
outputs:
  - artifact: "Validation result"
    location: "stdout"
    format: "text | json"
version: "1.0"
---

## Purpose

Validate that a sacred document's YAML frontmatter conforms to the canonical shape — required fields present, types correct, enums respected, version strings parse. Backed by [Ajv](https://github.com/ajv-validator/ajv) (MIT, in-process JS — no subprocess, no install), so it runs anywhere the `coldpress` CLI does.

Structural validation only. Semantic / cross-document policy ("the PRD must reference at least one ADR", "architecture.md changes must list approvers") is Conftest/Rego territory — see sibling skill `validate-sacred-doc`.

## When to Use

- Inside write-back steps of `@pm create-prd`, `@architect create-architecture`, `@analyst create-context`, `@architect create-tech-stack` — before committing the sacred doc, validate the frontmatter.
- As an acceptance check at Phase 3/4/5 gates (`validate-schema` referenced from `gate.json` `skill_ref`).
- Ad-hoc `coldpress governance validate-schema <path>` (CLI subcommand wires in a future block).

## Prerequisites

- `coldpress` CLI on PATH (Ajv ships with the package; no separate install).
- Sacred doc exists at the expected path.

## The 4 registered sacred-doc schemas

| Doc id | Schema file | Canonical path |
|--------|-------------|----------------|
| `context` | `schemas/sacred-docs/context.schema.json` | `_context/sacred/context.md` |
| `tech-stack` | `schemas/sacred-docs/tech-stack.schema.json` | `_context/sacred/tech-stack.md` |
| `prd` | `schemas/sacred-docs/prd.schema.json` | `_context/sacred/prd.md` |
| `architecture` | `schemas/sacred-docs/architecture.schema.json` | `_context/sacred/architecture.md` |

(The `pert-chart` sacred doc + schema were retired in v0.4 — the computed story graph + `coldpress waves` superseded it.)

Adding a new sacred doc means:
1. Ship a new JSON Schema under `schemas/sacred-docs/<id>.schema.json`.
2. Add the mapping to `SACRED_DOC_SCHEMAS` in `src/governance/validate-schema.ts`.
3. Add a row to this table.

## Process

1. Load the doc; slice its YAML frontmatter (the `---\n…\n---` prefix).
2. Resolve the schema by doc basename (`prd.md` → `prd.schema.json`).
3. Compile the schema with Ajv (cached).
4. Validate the parsed frontmatter.
5. On pass: exit `0`. On fail: print every issue with JSON Pointer path + message, exit `1`.

## Output

Text list of issues on fail. Each issue has shape `{ path, message, keyword }`.

## Failure modes

- **No frontmatter** or malformed YAML — one top-level issue, exit `1`.
- **Unknown sacred-doc id** — skill exits `1` with the list of registered ids.
- **Schema file missing** — indicates framework corruption; exits `1`.

## Why Ajv, not Zod

Zod is TypeScript-first; sacred-doc authors write JSON Schemas so the schemas can be shared with editor integrations (JSON Schema's ecosystem is bigger than Zod's). Ajv is the most widely-deployed JSON Schema validator (MIT). Coldpress-os uses Zod for TS-internal contracts (handoffs, graph, phase-gate) and Ajv for user-facing document contracts (sacred-doc frontmatter).

## Licence

Ajv is MIT. ajv-formats (date / date-time / email formats) is MIT.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial Ajv-backed sacred-doc frontmatter validator — part of Wave 5 Block Y §5.2. Ships 5 JSON Schemas (context/tech-stack/prd/architecture/pert-chart), in-process validator at `src/governance/validate-schema.ts`. |
