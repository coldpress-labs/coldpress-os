---
name: "brainstorming"
description: "Facilitate interactive brainstorming sessions using 60+ creative techniques"
type: "workflow"
category: "creative"
agent: "analyst"
phases: [2, 4, 8]
inputs:
  - "session topic or challenge"
  - "../../data/methods/brainstorming-techniques.csv"
outputs:
  - artifact: "Brainstorming Session"
    location: "_context/creative/brainstorm-{topic}-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Facilitates interactive brainstorming sessions using a library of 60+ creative techniques across 10 categories (collaborative, creative, deep, introspective, structured, theatrical, wild, biomimetic, quantum, cultural). Keeps users in generative exploration mode with a target of 100+ ideas before organization.

## When to Use

- "brainstorm ideas for..."
- "let's brainstorm"
- "creative session"
- When exploring new product directions or features
- When stuck on a problem and need fresh perspectives
- When generating ideas for any creative challenge

## Prerequisites

- A clear topic or challenge to brainstorm about
- Data asset: `../../data/methods/brainstorming-techniques.csv`

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A brainstorming session document with all ideas generated, themes identified, top priorities, and action plan.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-brainstorming, adapted to coldpress-os schema |
