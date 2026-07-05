---
name: "template-builder"
description: "Create and edit document or infrastructure templates"
type: "workflow"
category: "meta"
agent: "butler"
on-demand: true   # WS11 S4: valet-invoked meta tool (no lifecycle route) -- audited keep
phases: [meta]
inputs:
  - "../../authoring/"
  - "template purpose and requirements"
outputs:
  - artifact: "Template File"
    location: "../../authoring/{category}/{template-name}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Creates or edits document templates (PRD, architecture, story, etc.) and infrastructure templates (CLAUDE.md, SYSTEM.md, cursorrules) for the coldpress-os framework. Ensures templates follow conventions and include all required sections.

## When to Use

- "create a template"
- "edit template"
- "build a document template"
- When adding new document types to the framework
- When updating existing templates based on usage feedback

## Prerequisites

- Existing templates directory: `../../authoring/`
- Clear purpose and requirements for the template

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A template file in the appropriate templates directory.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New meta skill for coldpress-os framework evolution |
