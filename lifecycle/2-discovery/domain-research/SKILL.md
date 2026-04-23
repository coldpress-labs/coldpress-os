---
name: "domain-research"
description: "Conduct comprehensive domain and industry research using web sources"
type: "workflow"
category: "lifecycle"
phase: 2
agent: "analyst"
inputs:
  - "coldpress.yaml"
  - "docs/context.md"
outputs:
  - artifact: "Domain Research"
    location: "_context/planning/research/domain-{topic}-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Conducts deep domain and industry research using web search to build foundational understanding of the problem space. Produces a comprehensive research document with verified sources, industry trends, key players, and domain-specific insights.

## When to Use

- "research the domain"
- "domain research for {industry}"
- "help me understand this industry"
- When the project operates in an unfamiliar domain
- When domain-specific knowledge is critical to product decisions

## Prerequisites

- `docs/context.md` for project context
- Web search capability required

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A comprehensive domain research document with industry analysis, key terminology, trends, regulations, and implications for the project.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-domain-research, adapted for coldpress-os |
