---
name: "product-evolution"
description: "Plan the next iteration of the product based on learnings and market changes"
type: "workflow"
category: "lifecycle"
phase: 11
agent: "pm"
inputs:
  - "retrospective documents"
  - "_context/sacred/context.md"
  - "_context/sacred/prd.md"
outputs:
  - artifact: "Evolution Plan"
    location: "_context/planning/product-evolution-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Plans the next version or iteration of the product by synthesizing retrospective insights, user feedback, market changes, and technical learnings into a product evolution roadmap.

## When to Use

- "plan next version"
- "product evolution"
- "what should we build next?"
- After completing a major milestone
- When user feedback or market changes warrant a new direction

## Prerequisites

- At least one completed epic with retrospective
- Existing PRD and context docs

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A product evolution plan with prioritized features, updated scope, and recommendation on whether to loop back to Phase 2 (discovery), Phase 4 (planning), or Phase 5 (breakdown).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | New skill for coldpress-os post-launch iteration |
