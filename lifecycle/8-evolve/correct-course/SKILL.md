---
name: "correct-course"
description: "Manage significant changes during sprint execution through structured impact analysis"
type: "workflow"
category: "lifecycle"
phase: 8
agent: "scrum-master"
inputs:
  - "change trigger description"
  - "_context/planning/prd.md"
  - "_context/planning/epics.md"
  - "_context/planning/architecture.md"
outputs:
  - artifact: "Sprint Change Proposal"
    location: "_context/planning/sprint-change-proposal-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Manages significant changes that arise during sprint execution — bugs that reveal design flaws, user feedback that shifts priorities, or technical discoveries that invalidate assumptions. Analyzes impact across PRD, epics, architecture, and UX, then produces a structured Sprint Change Proposal.

## When to Use

- "correct course"
- "we need to change direction"
- "this bug reveals a bigger problem"
- When a mid-sprint change affects multiple planning artifacts
- When user feedback requires scope adjustment

## Prerequisites

- Active sprint with existing planning documents
- Clear change trigger (what happened that requires adjustment)

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A Sprint Change Proposal with impact analysis, specific change recommendations, and implementation handoff guidance.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Migrated from bmad-correct-course, adapted for coldpress-os |
