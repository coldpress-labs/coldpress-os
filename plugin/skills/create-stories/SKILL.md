---
name: create-stories
description: Build comprehensive story context files that prevent AI implementation mistakes
license: MIT
compatibility: Invoked by @pm in Phase 5
version: "1.0"
---

## Purpose

Creates comprehensive story context files for individual stories -- the "Ultimate Context Engine" that prevents AI implementation mistakes. For each story, loads all project artifacts, extracts developer guardrails, performs web research for latest technical specifics, and produces a self-contained implementation brief.

Each story file contains everything a developer (human or AI) needs to implement that story correctly without consulting other documents.

## When to Use

- "create story context for E1-S1"
- "build implementation brief for this story"
- "prepare a story for development"
- "generate story file"
- After epics are created, before or during implementation

## Prerequisites

- `_context/planning/epics.md` exists (from create-epics)
- `_context/sacred/prd.md` and `_context/sacred/architecture.md` exist
- Target story identified (from sprint-status or user input)

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_context/implementation/{story-key}.md` -- a self-contained story context file with all implementation details, guardrails, and technical specifics needed for development. Updates `sprint-status.yaml` story status to `ready-for-dev`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial create-stories skill for Phase 5 |
