---
name: "sprint-status"
description: "Summarize sprint progress, surface risks, and recommend next action"
type: "workflow"
category: "lifecycle"
phase: 8
agent: "scrum-master"
inputs:
  - "_context/tracking/sprint-status.yaml"
outputs:
  - artifact: "Sprint Summary"
    location: "inline (conversation)"
    format: "interactive"
version: "1.0"
---

## Purpose

Reads sprint-status.yaml and produces a clear summary: what's done, what's in progress, what's at risk, and what to do next. Acts as the Scrum Master providing visibility into sprint health.

## When to Use

- "sprint status"
- "what should I work on next?"
- "how's the sprint?"
- At the start of a work session to get oriented
- When deciding which story to implement next

## Prerequisites

- sprint-status.yaml must exist

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

Interactive sprint summary with next-action recommendation. No file artifact produced.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Migrated from bmad-sprint-status, adapted for coldpress-os |
