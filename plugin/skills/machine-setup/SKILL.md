---
name: machine-setup
description: Verify development environment has all required tools and configurations
license: MIT
compatibility: Invoked by @butler in Phase 1
version: "1.0"
---

## Purpose

Verifies that the developer's machine has all prerequisites for coldpress-os development — Node.js, git, package manager, Claude Code, and any stack-specific tools.

## When to Use

- "check my setup"
- "verify my environment"
- At the very start of a new project before any other work
- When onboarding a new developer or machine

## Prerequisites

- Terminal access
- Internet connection (for version checks)

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

An environment report listing all tools checked, their versions, and any required actions.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial machine-setup skill for Phase 1 |
