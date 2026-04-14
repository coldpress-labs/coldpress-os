---
name: "agent-scaffold"
description: "Generate .claude/ thin wrappers and configure Butler as the project orchestrator"
type: "workflow"
category: "lifecycle"
phase: 1
agent: "butler"
inputs:
  - "coldpress.yaml"
  - "coldpress-os/skills/"
  - "install/generate-wrappers.md"
outputs:
  - artifact: "Butler Configuration"
    location: ".claude/SYSTEM.md"
    format: "markdown"
  - artifact: "Skill Wrappers"
    location: ".claude/skills/"
    format: "markdown"
version: "1.0"
---

## Purpose

Generates the `.claude/` directory with thin skill wrappers that point into coldpress-os, and configures Butler (the project-level orchestrator agent) via `SYSTEM.md`. This bridges the project to the framework.

## When to Use

- "set up Butler"
- "generate wrappers"
- "scaffold agents"
- After `project-init` completes
- After updating coldpress-os submodule (to regenerate wrappers)

## Prerequisites

- `coldpress.yaml` must exist
- coldpress-os must be available (submodule or local)

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A fully configured `.claude/` directory with SYSTEM.md (Butler directive) and thin skill wrappers for all framework skills.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-14 | Alfred | Renamed mao-scaffold → agent-scaffold. Removed MAO acronym. |
| 1.0 | 2026-04-08 | Alfred | Initial skill for Phase 1 |
