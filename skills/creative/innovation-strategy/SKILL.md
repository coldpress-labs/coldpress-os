---
name: "innovation-strategy"
description: "Identify disruption opportunities and architect new business models"
type: "workflow"
category: "creative"
agent: "analyst"
phases: [2, 8]
inputs:
  - "market or product context"
  - "../../data/methods/innovation-frameworks.csv"
outputs:
  - artifact: "Innovation Strategy"
    location: "_context/planning/creative/innovation-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Identifies disruption opportunities, analyzes market positioning, and architects new business models or product strategies using innovation frameworks. Focuses on finding blue ocean opportunities and sustainable competitive advantages.

## When to Use

- "innovation strategy"
- "find disruption opportunities"
- "business model exploration"
- When exploring new market directions
- When existing products need strategic evolution
- When evaluating competitive landscape for opportunities

## Prerequisites

- Market or product context (industry, current offering, competitors)
- Data asset: `../../data/methods/innovation-frameworks.csv`

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

An innovation strategy document with market analysis, disruption opportunities, business model concepts, and strategic recommendations.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New skill for coldpress-os creative suite |
