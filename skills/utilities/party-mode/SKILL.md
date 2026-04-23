---
name: "party-mode"
description: "Orchestrate multi-agent group discussions between all available agent personas"
type: "workflow"
category: "utilities"
status: "ad-hoc"
phases: [2, 4, 5, 8]
inputs:
  - "discussion topic or question"
  - "../../data/agents/agent-roster.csv"
outputs:
  - artifact: "Discussion Transcript"
    location: "_context/planning/discussions/party-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Orchestrates a multi-agent discussion by activating all 9 subagent perspectives and facilitating an interactive conversation where each contributes their unique expertise on a given topic. Reads the consolidated roster from `data/agents/agent-roster.csv`.

## When to Use

- "party mode"
- "group discussion"
- "get all agents' opinions"
- When a decision benefits from multiple expert perspectives
- For brainstorming with diverse viewpoints
- When exploring trade-offs across domains (design vs. engineering vs. product)

## Prerequisites

- At least one discussion topic or question
- Data asset: `../../data/agents/agent-roster.csv`

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A discussion transcript with agent contributions, key insights, and session summary.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-party-mode, adapted to coldpress-os schema |
