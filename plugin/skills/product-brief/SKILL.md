---
name: product-brief
description: Create a 1-2 page executive product brief through collaborative discovery — synthesises Discovery research into a forward-pointing brief
license: MIT
compatibility: Invoked by @analyst in Phase 4
version: "1.0"
---

## Purpose

Creates a concise 1-2 page executive product brief through collaborative discovery. The brief captures the product vision, target users, value proposition, key features, success metrics, and strategic direction in a format suitable for stakeholders and downstream planning skills.

## When to Use

- "create product brief"
- "write a product brief"
- "start planning"
- Always the **first** skill in Phase 4
- When you need to crystallize product direction before detailed requirements

## Activation Modes

| Mode | Flag | Behavior |
|------|------|----------|
| **Guided** | _(default)_ | Step-by-step collaborative discovery with user input at each step |
| **Autonomous** | `-A` | Agent drafts the brief from existing docs, presents for review |
| **Yolo** | `--yolo` | Agent drafts and writes without stopping — user reviews after |

## Prerequisites

- Phase 3 complete (tech stack selected)
- `_context/sacred/context.md` available (from discovery)
- User has clarity on what the product should be

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_context/planning/product-brief-{date}.md` — a concise executive product brief. Optionally, a distillate version for quick reference.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial product-brief skill definition |
