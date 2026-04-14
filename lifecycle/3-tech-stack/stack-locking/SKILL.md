---
name: "stack-locking"
description: "Lock the tech stack by consolidating ADRs into the sacred docs/tech-stack.md"
type: "workflow"
category: "lifecycle"
phase: 3
agent: "architect"
inputs:
  - "docs/context.md"
  - "_output/planning/adr-*.md"
outputs:
  - artifact: "Tech Stack Document"
    location: "docs/tech-stack.md"
    format: "markdown"
    sacred: true
version: "1.0"
---

## Purpose

Consolidates all Architecture Decision Records (ADRs) from stack-evaluation into a single, authoritative tech stack document. This document becomes the **sacred source of truth** for all technology choices in the project. Once locked, no technology changes happen without revisiting this document.

## When to Use

- "lock the tech stack"
- "finalize technology decisions"
- "create tech-stack.md"
- "consolidate the ADRs"
- After all major technology evaluations are complete

## Prerequisites

- At least one ADR produced by stack-evaluation
- All critical technology decisions evaluated (frontend, backend, database at minimum)
- `docs/context.md` for project context

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

`docs/tech-stack.md` — the sacred, locked tech stack document covering all technology decisions: frontend, backend, database, authentication, hosting, testing, and CI/CD.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial stack-locking skill for Phase 3 |
