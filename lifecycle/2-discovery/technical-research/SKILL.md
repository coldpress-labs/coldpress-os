---
name: "technical-research"
description: "Conduct technical research on technologies, frameworks, and architecture approaches"
type: "workflow"
category: "lifecycle"
phase: 2
agent: "analyst"
inputs:
  - "coldpress.yaml"
  - "docs/context.md"
outputs:
  - artifact: "Technical Research"
    location: "_output/planning/research/technical-{topic}-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Conducts technical research comparing technologies, frameworks, tools, and architectural approaches. Evaluates options based on project requirements and produces a recommendation with trade-off analysis.

## When to Use

- "technical research"
- "compare frameworks"
- "evaluate technologies"
- When choosing between technical approaches
- When investigating feasibility of a technology

## Prerequisites

- `docs/context.md` for project context
- Web search capability recommended

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A technical research report with technology comparison, trade-off analysis, and recommendation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-technical-research, adapted for coldpress-os |
