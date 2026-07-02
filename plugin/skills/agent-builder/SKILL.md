---
name: agent-builder
description: Build, edit, or analyze agent definitions for the coldpress-os framework
license: MIT
compatibility: Invoked by @butler in Phase meta
version: "1.0"
---

## Purpose

Creates, edits, or analyzes agent persona definitions following the coldpress-os agent schema. Ensures consistency across the agent roster, validates required fields, and maintains the agent roster CSV.

## When to Use

- "create a new agent"
- "edit agent definition"
- "analyze the agent roster"
- When adding a new specialist persona to the framework
- When updating an agent's capabilities or communication style
- When auditing agent definitions for consistency

## Prerequisites

- Agent schema: `../../agents/_schema.md`
- Agent roster: `../../data/agents/agent-roster.csv`

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A complete agent definition file conforming to the schema, plus updated roster CSV.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New meta skill for coldpress-os framework evolution |
