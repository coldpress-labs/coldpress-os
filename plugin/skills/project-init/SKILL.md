---
name: project-init
description: Initialize a new project with coldpress-os framework and configuration
license: MIT
compatibility: Invoked by @butler in Phase 1
version: "1.0"
---

## Purpose

Creates a new project directory with coldpress-os installed as a git submodule, generates the project configuration (`coldpress.yaml`), copies the project template, and sets up the initial directory structure for development.

## When to Use

- "start a new project"
- "initialize coldpress-os"
- "create project with coldpress"
- When beginning any new ColdPress Labs project

## Prerequisites

- git installed and configured
- Node.js available
- Target directory chosen

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A fully initialized project directory with coldpress-os submodule, configuration, and directory structure ready for Phase 2.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial project-init skill for Phase 1 |
