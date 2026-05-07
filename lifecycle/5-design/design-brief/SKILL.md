---
name: "design-brief"
description: "Comprehensive design brief covering product, content, visual, and platform foundation"
type: "workflow"
category: "lifecycle"
phase: 4
agent: "ux-designer"
inputs:
  - "_context/sacred/context.md"
  - "_context/planning/product-brief-{date}.md (if bridge mode)"
  - "Brand references and visual inspiration"
outputs:
  - artifact: "Design Brief"
    location: "_context/planning/design-brief-{date}.md"
    format: "markdown"
    sacred: false
version: "1.0"
---

## Purpose

Creates a comprehensive design brief that covers product positioning, content strategy, visual direction, and platform requirements. Serves as the foundational design document that guides all downstream UX and visual design work.

## Operating Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Standalone** | No product brief exists | Full discovery from scratch — all steps executed |
| **Bridge** | Product brief detected/provided | Imports product-brief, skips steps 1-12 of standalone discovery, begins at content strategy |

In bridge mode, the skill automatically loads the product brief and uses it as context, dramatically reducing redundant discovery.

## When to Use

- "create design brief"
- "design brief"
- After product-brief is complete (bridge mode recommended)
- When establishing visual and content direction for the project

## Prerequisites

- Phase 3 complete (tech stack selected)
- Product brief recommended (enables bridge mode) but not required

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_context/planning/design-brief-{date}.md` — comprehensive design brief covering content strategy, visual direction, design tokens, and platform requirements.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial design-brief skill definition |
