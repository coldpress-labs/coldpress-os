---
name: "pre-project-interview"
description: "Structured discovery interview to produce the project context document"
type: "workflow"
category: "lifecycle"
phase: 2
agent: "analyst"
inputs:
  - "coldpress.yaml"
  - "user knowledge about the project"
outputs:
  - artifact: "Project Context"
    location: "docs/context.md"
    format: "markdown"
    sacred: true
version: "1.0"
---

## Purpose

Conducts a structured multi-phase interview to extract everything an AI agent needs to know about the project — its purpose, users, constraints, rules, patterns, and critical guidelines. Produces `context.md`, a sacred document that becomes the foundation for all downstream work.

## When to Use

- "start discovery"
- "create project context"
- "pre-project interview"
- Always the **first** skill in Phase 2
- When starting any new project

## Prerequisites

- `coldpress.yaml` configured (Phase 1 complete)
- User has knowledge about the project they want to build

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

`docs/context.md` — a lean, LLM-optimized document with implementation rules, patterns, and critical project guidelines. This is a **sacred document** protected by governance workflows.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-generate-project-context, adapted for coldpress-os |
