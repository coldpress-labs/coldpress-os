---
name: "market-research"
description: "Conduct market analysis and competitive landscape research using web sources"
type: "workflow"
category: "lifecycle"
phase: 2
agent: "analyst"
inputs:
  - "coldpress.yaml"
  - "_context/sacred/context.md"
  - "_context/tracking/intake-{date}.md"
  - ".coldpress/local-config.yaml (for project_shape)"
  - ".coldpress/graph/graph.json (query _input/reference/ before web-search)"
outputs:
  - artifact: "Market Research"
    location: "_context/planning/research/market-{topic}-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Conducts comprehensive market research — competitive analysis, customer segments, market sizing, pricing models, and go-to-market insights. Uses web research with verified sources.

## When to Use

- "market research"
- "competitive analysis"
- "who else does this?"
- When validating market opportunity
- When understanding competitive landscape

## Prerequisites

- `_context/sacred/context.md` for project context
- Web search capability required

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A market research report with competitive landscape, customer segments, market sizing, and strategic implications.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-market-research, adapted for coldpress-os |
