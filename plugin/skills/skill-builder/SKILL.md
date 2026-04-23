---
name: skill-builder
description: Create and edit skill definitions for the coldpress-os framework
license: MIT
compatibility: Invoked by @valet in Phase meta
version: "1.0"
---

## Purpose

Creates or edits skill definitions following the coldpress-os skill schema. Generates SKILL.md, workflow.md, and step files as needed. Updates the skill catalog CSV.

## When to Use

- "create a new skill"
- "edit skill definition"
- "build a skill"
- When adding new capabilities to the framework
- When modifying existing skill behavior

## Prerequisites

- Skill schema: `../_schema.md`
- Skill catalog: `../../data/agents/skill-catalog.csv`

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

Complete skill definition with SKILL.md, optional workflow.md and step files, plus updated catalog.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New meta skill for coldpress-os framework evolution |
