---
name: "create-prd"
description: "Create comprehensive Product Requirements Document through structured facilitation"
type: "workflow"
category: "lifecycle"
phase: 4
agent: "pm"
inputs:
  - "docs/context.md"
  - "_output/planning/product-brief-{date}.md"
  - "_output/planning/design-brief-{date}.md"
  - "docs/tech-stack.md"
outputs:
  - artifact: "Product Requirements Document"
    location: "_output/planning/prd.md"
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
- `docs/tech-stack.md` available
- `docs/context.md` available

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_output/planning/prd.md` — comprehensive Product Requirements Document. This is a **sacred document** protected by governance workflows.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial create-prd skill definition |
