---
phase: 1
name: "Bootstrap"
description: "Project initialization — machine setup, project scaffolding, and Butler configuration"
prerequisites: []
outputs:
  - "Working development environment"
  - "Project directory structure"
  - "coldpress.yaml configuration"
  - "Butler (SYSTEM.md) configured"
next_phase: "2-discovery"
---

# Phase 1: Bootstrap

> Get from zero to a working project with coldpress-os configured.

## What Happens Here

1. **Machine Setup** — Verify dev environment has required tools
2. **Project Init** — Create project structure, install coldpress-os submodule, generate config
3. **Agent Scaffold** — Generate `.claude/` wrappers and configure Butler as the project orchestrator

## Sub-Skills

| Sub-Skill | Type | Description |
|-----------|------|-------------|
| [machine-setup](machine-setup/) | simple | Verify development environment prerequisites |
| [project-init](project-init/) | workflow | Initialize project with coldpress-os |
| [agent-scaffold](agent-scaffold/) | workflow | Generate .claude/ wrappers and Butler config |

## Entry Conditions

- User wants to start a new project with coldpress-os
- Or user wants to add coldpress-os to an existing project

## Exit Conditions

- Project directory exists with coldpress-os submodule
- `coldpress.yaml` configured with project details
- `.claude/SYSTEM.md` and `CLAUDE.md` generated
- Development environment verified
- Ready to proceed to Phase 2 (Discovery)

## Available Templates

See `templates/` directory for:
- `CLAUDE.md` project template
- `SYSTEM.md` Butler directive template
- `.cursorrules` template

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial Phase 1 definition |
