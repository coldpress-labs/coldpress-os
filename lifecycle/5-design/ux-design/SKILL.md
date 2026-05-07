---
name: "create-ux-design"
description: "Plan UX patterns, user flows, and design specifications"
type: "workflow"
category: "lifecycle"
phase: 4
agent: "ux-designer"
inputs:
  - "_context/sacred/prd.md"
  - "_context/planning/design-brief-{date}.md"
  - "_context/sacred/context.md"
outputs:
  - artifact: "UX Design Specification"
    location: "_context/design/ux-design-spec.md"
    format: "markdown"
    sacred: false
version: "1.0"
---

## Purpose

Plans UX patterns, user flows, information architecture, key screen concepts, and interaction patterns. Produces a comprehensive UX design specification that bridges the PRD's requirements with implementable design decisions.

## When to Use

- "create UX design"
- "plan the UX"
- "design the user experience"
- After PRD is created and validated
- When the team needs concrete UX direction before implementation

## Prerequisites

- `_context/sacred/prd.md` exists (sacred document)
- Design brief recommended for visual alignment
- `_context/sacred/context.md` available for user understanding

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_context/design/ux-design-spec.md` — comprehensive UX specification including user flows, information architecture, key screen concepts, interaction patterns, and responsive strategy.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial create-ux-design skill definition |
