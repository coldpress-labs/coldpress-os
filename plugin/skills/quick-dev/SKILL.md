---
name: quick-dev
description: Rapid implementation for bugs, small features, and refactors without full story ceremony
license: MIT
compatibility: Invoked by @developer in Phase 6
version: "1.0"
---

## Purpose

Turns user intent into a hardened, reviewable artifact — fast. For bugs, small features, and refactors that don't need full story ceremony. Produces a lightweight spec, implements it, and validates. Scope standard: single user-facing goal, 900-1600 tokens.

## When to Use

- "quick dev"
- "fix this bug"
- "quick feature"
- "refactor this"
- When the task is too small for a full story but needs structure

## Prerequisites

- `_context/sacred/context.md` for project guardrails
- Clear single-goal intent from user

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

Lightweight spec and implemented code with tests.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Migrated from bmad-quick-dev, adapted for coldpress-os |
