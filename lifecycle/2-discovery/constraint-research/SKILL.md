---
name: "constraint-research"
description: "Research domain-technical constraints (compliance, protocols, algorithms, performance envelopes, accessibility) that bound the solution space"
type: "workflow"
category: "lifecycle"
phase: 2
agent: "analyst"
inputs:
  - "coldpress.yaml"
  - "_context/sacred/context.md"
  - "_context/tracking/intake-{date}.md"
  - ".coldpress/local-config.yaml (for project_shape)"
  - ".coldpress/graph/graph.json (query _input/reference/ + _input/vendor/ first)"
outputs:
  - artifact: "Constraint Research"
    location: "_context/planning/research/constraint-{topic}-{date}.md"
    format: "markdown"
version: "2.0"
---

## Purpose

Researches the hard constraints that bound the solution space before Phase 3 picks a stack. Surfaces compliance requirements (GDPR, HIPAA, SOC2, ISO 27001), communication protocols, algorithmic / throughput envelopes, performance budgets, accessibility targets (WCAG), device/browser matrices, locale/language requirements, and regulatory obligations. Produces a constraint envelope — a set of MUST-satisfy conditions — not a technology comparison.

Technology evaluation and stack selection happen in Phase 3. This skill feeds that work by establishing what the chosen stack must honour.

## When to Use

- "constraint research"
- "compliance requirements"
- "performance / accessibility / regulatory constraints"
- When bounding the solution space before stack selection
- When the project has regulatory, performance, or accessibility obligations that shape downstream choices

## Prerequisites

- `_context/sacred/context.md` for project context (status `seed` or `authored`)
- Web search capability recommended
- `_input/reference/` and `_input/vendor/` indexed in the graph if the user pre-loaded compliance / SDK docs

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A constraint envelope document listing each MUST-satisfy constraint with source citation, severity (blocking / preferred / aspirational), and a direct implication for the most affected downstream phase (stack, architecture, UX).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-24 | Cadbury-hq | Body rewrite per Phase II Part 2 Wave 1.1 — skill now produces a constraint envelope (compliance / protocols / performance / accessibility / regulatory / locale), not a technology comparison. Technology evaluation moves to Phase 3. Output renamed `technical-{topic}-{date}.md` → `constraint-{topic}-{date}.md` per Wave 1.2. Step 3 refocused on constraint synthesis; Step 4 produces a binding envelope, not a recommendation report. |
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-technical-research, adapted for coldpress-os |
