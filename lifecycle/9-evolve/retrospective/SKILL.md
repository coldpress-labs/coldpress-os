---
name: "retrospective"
description: "Post-epic review to extract lessons learned and prepare for next epic"
type: "workflow"
category: "lifecycle"
phase: 8
agent: "scrum-master"
inputs:
  - "_context/tracking/sprint-status.yaml"
  - "_context/planning/epics.md"
  - "previous retrospective (if exists)"
outputs:
  - artifact: "Retrospective"
    location: "_context/audit/retro-epic-{N}-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Facilitates a post-epic retrospective to extract lessons learned, celebrate successes, and prepare for the next epic. Uses a no-blame, systems-focused approach with natural dialogue. Two-part format: (1) Epic Review + (2) Next Epic Preparation.

## When to Use

- "retrospective"
- "retro for epic {N}"
- "what did we learn?"
- After completing an epic
- When sprint-status.yaml shows optional retrospective entries

## Prerequisites

- At least one epic with stories in `done` status
- sprint-status.yaml for epic discovery

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Key Principle

**Psychological safety is paramount — NO BLAME.** Focus on systems, processes, and learning.

## Output

A retrospective document with lessons learned, action items, and next epic preparation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Migrated from bmad-retrospective, adapted for coldpress-os |
