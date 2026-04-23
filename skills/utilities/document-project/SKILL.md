---
name: "document-project"
description: "Document existing brownfield projects for AI-assisted development context"
type: "workflow"
category: "utilities"
agent: "communicator"
phases: [8]
inputs:
  - "project root directory"
  - "../../data/classification/documentation-requirements.csv"
outputs:
  - artifact: "Project Documentation"
    location: "_context/docs/"
    format: "markdown"
  - artifact: "Documentation Index"
    location: "_context/docs/index.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Documents existing (brownfield) codebases for AI-assisted development. Scans the project structure, classifies the project type, analyzes the tech stack, and generates comprehensive documentation that provides full context for AI agents to work effectively in the codebase.

## When to Use

- "document this project"
- "generate project context"
- "scan and document codebase"
- When onboarding AI agents to an existing project
- When starting AI-assisted development on a brownfield codebase
- When project documentation is outdated or missing

## Prerequisites

- Project must be a working codebase (not an empty scaffold)
- Read access to all project files
- Data asset: `../../data/classification/documentation-requirements.csv`

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A comprehensive documentation suite including: project overview, source tree, architecture documentation, component documentation, development guide, and a master index. All written to `_context/docs/`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-document-project, adapted to coldpress-os schema |
