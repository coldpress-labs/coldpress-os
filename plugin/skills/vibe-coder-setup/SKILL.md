---
name: vibe-coder-setup
description: Set up the development environment based on the locked tech stack
license: MIT
compatibility: Invoked by @developer in Phase 3
version: "1.0"
---

## Purpose

Sets up the complete development environment based on the locked tech stack. Installs all dependencies, configures linting and formatting, sets up git hooks, creates environment variable templates, configures editor settings, and verifies everything works together. The goal: after this skill runs, you can start coding immediately.

## When to Use

- "set up the dev environment"
- "install dependencies"
- "configure the project"
- "vibe coder setup"
- "get the project ready to code"
- After the tech stack has been locked in _context/sacred/tech-stack.md

## Prerequisites

- `_context/sacred/tech-stack.md` exists and is locked (sacred)
- Project directory initialized (Phase 1 bootstrap complete)
- Node.js / relevant runtime installed on the machine

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A fully configured development environment: dependencies installed, linting/formatting configured, git hooks active, .env template created, editor settings in place, and build/lint/test all passing.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial vibe-coder-setup skill for Phase 3 |
