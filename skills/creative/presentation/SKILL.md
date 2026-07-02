---
name: "presentation"
description: "Create presentations and visual communication strategies"
type: "workflow"
category: "creative"
status: "cross-cutting"
agent: "butler"
phases: [4, 8]
inputs:
  - "content, data, or message to present"
outputs:
  - artifact: "Presentation Plan"
    location: "_context/planning/creative/presentation-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Creates structured presentations with clear narrative flow, supporting data visualization strategies, and speaker notes. Covers everything from the story arc to individual slide concepts.

## When to Use

- "create a presentation"
- "help me build a deck"
- "presentation for..."
- When preparing a pitch, demo, or conference talk
- When communicating results or strategies to stakeholders

## Prerequisites

- Content, data, or message to present
- Target audience and context (meeting type, time limit)

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A presentation plan document with slide outlines, speaker notes, and data visualization recommendations.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New skill for coldpress-os creative suite |
