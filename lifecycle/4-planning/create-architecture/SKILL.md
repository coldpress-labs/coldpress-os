---
name: "create-architecture"
description: "Create technical architecture decisions for AI agent consistency"
type: "workflow"
category: "lifecycle"
phase: 4
agent: "architect"
inputs:
  - "_context/sacred/prd.md"
  - "_context/sacred/tech-stack.md"
  - "_context/sacred/context.md"
  - "_context/design/ux-design-spec.md"
outputs:
  - artifact: "Architecture Document"
    location: "_context/sacred/architecture.md"
    format: "markdown"
    sacred: true
version: "1.0"
---

## Purpose

Creates the technical architecture document — a **sacred document** that captures system design, data models, API design, key architecture decision records (ADRs), patterns, and anti-patterns. Designed for AI agent consistency: every agent that reads this document should make the same architectural choices.

## When to Use

- "create architecture"
- "design the architecture"
- "technical architecture"
- After PRD and UX design specification are complete
- When the team needs a definitive technical blueprint before implementation

## Prerequisites

- `_context/sacred/prd.md` exists (sacred document)
- `_context/sacred/tech-stack.md` available (technology decisions)
- `_context/sacred/context.md` available (project constraints)
- UX design specification recommended for interface contracts

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_context/sacred/architecture.md` — comprehensive technical architecture document. This is a **sacred document** protected by governance workflows.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial create-architecture skill definition |
