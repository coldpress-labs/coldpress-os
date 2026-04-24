---
name: "create-prd"
description: "Create comprehensive Product Requirements Document through structured facilitation"
type: "workflow"
category: "lifecycle"
phase: 4
agent: "pm"
inputs:
  - "_context/sacred/context.md"
  - "_context/planning/product-brief-{date}.md"
  - "_context/planning/design-brief-{date}.md"
  - "_context/sacred/tech-stack.md"
outputs:
  - artifact: "Product Requirements Document"
    location: "_context/sacred/prd.md"
    format: "markdown"
    sacred: true
version: "1.0"
---

## Purpose

Creates a comprehensive Product Requirements Document (PRD) through structured facilitation. The PRD is a **sacred document** — the authoritative specification of what to build, why, and to what standard. Supports three operating modes: create, edit, and validate.

## Operating Modes

| Mode | Flag | Behavior |
|------|------|----------|
| **Create** | `c` _(default)_ | Full PRD creation from scratch via `steps/` |
| **Edit** | `e` | Load existing PRD, guided modification via `steps-e/` |
| **Validate** | `v` | Validate existing PRD against standards via `steps-v/` |

Mode is detected automatically in step-01 based on whether a PRD already exists, or can be specified explicitly.

## When to Use

- "create PRD"
- "write product requirements"
- "edit the PRD"
- After product-brief and design-brief are complete
- When the team needs a formal requirements specification

## Prerequisites

- Product brief exists (recommended)
- Design brief exists (recommended)
- `_context/sacred/tech-stack.md` available
- `_context/sacred/context.md` available

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_context/sacred/prd.md` — comprehensive Product Requirements Document. This is a **sacred document** protected by governance workflows.

## Output Contract

> Pattern 5 from `docs/prompt-patterns.md` — restate the format spec at generation time.

You must emit exactly one Markdown document with this structure:

1. `# Product Requirements Document — <project.name>` as the first line.
2. YAML frontmatter with fields: `sacred: true`, `version: "1.0"`, `created` (ISO date), `last_modified` (ISO date), `governance: "requires-review"`, `workflowType: "prd"`, `stepsCompleted: []`, `inputDocuments: []`, `adr_references: []` (at least one ADR id matching `^ADR-\d{4}$` per the `prd_has_adr` Rego policy in Block Y).
3. Sections 1 through 12 in the order specified by `templates/documents/prd.md`, each starting with `## <N>. <Section name>`.
4. Each section opens with the italicised meta-description inherited from the template (Pattern 1) — replace the placeholder prose, never delete the description.
5. No additional top-level sections. No trailing "Closing Thoughts" / "Summary" / "Notes" block.

Save to `_context/sacred/prd.md`. Confirm the save in the chat with the file path and line count.

Do NOT produce prose commentary around the artefact in the chat. The sacred doc is the output.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial create-prd skill definition |
| 1.1 | 2026-04-24 | Cadbury-hq | Added Output Contract (Pattern 5 from §6.7 MetaGPT prompt-pattern refactor, Block II). References templates/prompt-snippets/output-contract.md. |
