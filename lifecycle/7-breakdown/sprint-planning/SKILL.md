---
name: "sprint-planning"
description: "Generate sprint-status.yaml tracking file from epics with intelligent status detection"
type: "workflow"
category: "lifecycle"
phase: 5
agent: "scrum-master"
inputs:
  - "_context/planning/epics.md"
  - "_context/implementation/"
outputs:
  - artifact: "Sprint Status"
    location: "_context/tracking/sprint-status.yaml"
    format: "yaml"
version: "1.0"
---

## Purpose

Generates the `sprint-status.yaml` tracking file by parsing all epics and stories, detecting current status by checking for existing implementation files, and building a complete sprint tracking structure. Supports intelligent status preservation — never downgrades a story's status.

## When to Use

- "plan the sprint"
- "generate sprint status"
- "set up sprint tracking"
- After epics and stories are created
- When resetting or updating sprint tracking

## Prerequisites

- `_context/planning/epics.md` must exist with epics and stories defined
- Implementation directory should be accessible for status detection

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/tracking/sprint-status.yaml` with metadata, status definitions, and development_status map for all epics, stories, and retrospectives.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Migrated from bmad-sprint-planning, adapted for coldpress-os |
