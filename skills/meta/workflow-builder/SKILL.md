---
name: "workflow-builder"
description: "Build, convert, and analyze workflow definitions with step files"
type: "workflow"
category: "meta"
agent: "valet"
phases: [meta]
inputs:
  - "../../docs/step-file-spec.md"
  - "../_schema.md"
outputs:
  - artifact: "Workflow Definition"
    location: "target skill directory"
    format: "markdown"
version: "1.0"
---

## Purpose

Creates, converts, or analyzes workflow definitions and their step files. Can build new workflows from scratch, convert legacy workflows to coldpress-os format, or audit existing workflows for completeness and correctness.

## When to Use

- "build a workflow"
- "convert this workflow"
- "analyze workflow"
- When creating new multi-step skills
- When migrating legacy workflows to coldpress-os format
- When auditing workflow integrity

## Prerequisites

- Step file spec: `../../docs/step-file-spec.md`
- Skill schema: `../_schema.md`

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A complete workflow definition with workflow.md and all step files.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New meta skill for coldpress-os framework evolution |
