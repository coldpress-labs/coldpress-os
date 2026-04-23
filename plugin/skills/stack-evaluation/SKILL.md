---
name: stack-evaluation
description: Evaluate technology options and generate Architecture Decision Records (ADRs) for each choice
license: MIT
compatibility: Invoked by @architect in Phase 3
version: "1.0"
---

## Purpose

Evaluates technology options for a specific decision area (frontend framework, database, auth provider, hosting, etc.) through structured research and comparison. Produces an Architecture Decision Record (ADR) documenting the decision rationale, options considered, and final recommendation.

## When to Use

- "evaluate tech stack options"
- "help me choose a framework"
- "compare {technology A} vs {technology B}"
- "what database should I use?"
- "create an ADR for {decision}"
- When any technology choice needs to be made with documented reasoning

## Prerequisites

- `_context/sacred/context.md` for project requirements and constraints
- Understanding of project scale, budget, and team capabilities (from Phase 2)

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

An Architecture Decision Record (ADR) documenting the technology evaluation: options considered, comparison criteria, trade-offs, and the recommended choice with rationale.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial stack-evaluation skill for Phase 3 |
