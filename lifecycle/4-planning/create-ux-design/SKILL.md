---
name: "create-ux-design"
description: "Plan UX patterns, user flows, and design specifications"
type: "workflow"
category: "lifecycle"
phase: 4
agent: "ux-designer"
inputs:
  - "_output/planning/prd.md"
  - "_output/planning/design-brief-{date}.md"
  - "docs/context.md"
outputs:
  - artifact: "UX Design Specification"
    location: "_output/design/ux-design-spec.md"
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

- `_output/planning/prd.md` exists (sacred document)
- Design brief recommended for visual alignment
- `docs/context.md` available for user understanding

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_output/design/ux-design-spec.md` — comprehensive UX specification including user flows, information architecture, key screen concepts, interaction patterns, and responsive strategy.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial create-ux-design skill definition |
