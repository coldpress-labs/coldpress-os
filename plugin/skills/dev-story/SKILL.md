---
name: dev-story
description: Execute story implementation following the story spec with red-green-refactor cycle
license: MIT
compatibility: Invoked by @developer in Phase 6
version: "1.0"
---

## Purpose

Executes a story's implementation by following its context-rich spec file. Enforces the red-green-refactor cycle: write failing tests first, implement minimal code to pass, then refactor. Continues until ALL acceptance criteria are satisfied and ALL tasks are checked off.

## When to Use

- "implement this story"
- "dev story"
- "start building"
- When a story has status `ready-for-dev` or `in-progress` in sprint-status.yaml

## Prerequisites

- Story file must exist at `_context/implementation/{story-key}.md`
- Story must have acceptance criteria and developer context
- Test framework set up (see `test-framework` skill)

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Critical Constraints

- **NEVER stop for "milestones" or "session boundaries"** — continue until story COMPLETE or HALT condition
- **Only modify story file in:** Tasks checkboxes, Dev Agent Record, File List, Change Log, Status
- **Execute ALL steps in exact order — NO SKIPPING**

## Output

Implemented code, updated story file with all tasks checked, sprint-status.yaml updated to `review`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Migrated from bmad-dev-story, adapted for coldpress-os |
