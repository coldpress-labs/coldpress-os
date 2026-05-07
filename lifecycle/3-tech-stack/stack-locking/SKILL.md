---
name: "stack-locking"
description: "Consolidate ADRs into the sacred tech-stack.md. Product-type-aware category inventory, pre-lock review + red-flag escape hatch, baselines confirmation, and sacred lock with stack_pack + baselines block written to coldpress.yaml."
type: "workflow"
category: "lifecycle"
phase: 3
agent: "architect"
inputs:
  - "_context/planning/adrs/adr-*.md"
  - "_context/planning/stack-shortlist-v{N}.md"
  - "_context/sacred/context.md"
  - "_context/planning/product-brief-v{N}.md"
  - "_context/planning/idea-validation-v{N}.md"
  - "_context/planning/research-synthesis-v{N}.md"
  - "data/classification/project-types.csv"
  - "data/standards/baselines.yaml"
  - "coldpress.yaml"
  - ".coldpress/local-config.yaml"
outputs:
  - artifact: "Tech Stack Document"
    location: "_context/sacred/tech-stack.md"
    format: "markdown"
    sacred: true
    schema: "schemas/sacred-docs/tech-stack.schema.json"
  - artifact: "Stack Selection Summary"
    location: "_context/planning/stack-selection-summary-v{N}.md"
    format: "markdown"
    versioned: true
    schema: "schemas/distillates/stack-selection-summary.schema.json"
  - artifact: "coldpress.yaml updates"
    fields: ["stack_pack", "baselines"]
  - artifact: "Stack Lock Decision Log (conditional)"
    location: "_context/audit/stack-lock-decisions-{date}.md"
    format: "markdown"
    append_only: true
  - artifact: "Baselines Confirmations Log"
    location: "_context/audit/baselines-confirmations-{date}.md"
    format: "markdown"
    append_only: true
version: "2.0"
---

## Purpose

Consolidates all Architecture Decision Records into a single, sacred tech stack document and a validated distillate summary. The commit-point of Phase 3.

Seven steps: (1) product-type-aware ADR inventory + gap check; (2) draft tech-stack.md + distillate with editorial polish; (3) pre-lock user review with adversarial critique; (3a) red-flag escape hatch — mirrors `validate-idea` Step 9; (5a) mandatory baselines confirmation per category; (4) sacred lock with ordered sub-steps + yaml write-back; (5) phase-transition handoff.

**Sacred-lock sub-step ordering is load-bearing (R4-5):** validate-schema fires before `sacred: true` is written. A failed validation after sacred-lock would permanently lock an invalid document. Validate-first is the only safe design.

## When to Use

- "lock the tech stack"
- "finalize technology decisions"
- "create tech-stack.md"
- After all shortlist decision-areas have ADRs

## Prerequisites

- All product-type-required categories covered by ADRs (required set derived from `data/classification/project-types.csv` at Step 1 inventory)
- `_context/planning/stack-shortlist-v{N}.md` authored
- `_context/sacred/context.md` locked

## Tier 1 Core Methods

- **Step 1:** Gap Analysis + Constraint Identification — cited from `data/methods/problem-solving-methods.csv` (analysis category)
- **Step 3a:** Pre-mortem Analysis + Failure Mode Analysis (T0) + Six Thinking Hats (T0) — cited from problem-solving / elicitation risk methods

## Process

→ See [workflow.md](workflow.md) for the full process.

## Output

- `_context/sacred/tech-stack.md` — sacred, locked, schema-valid, with `derived_from` + `stack_pack` + `baselines` fields
- `_context/planning/stack-selection-summary-v{N}.md` — validated distillate (regeneratable)
- `coldpress.yaml` `stack_pack` + `baselines:` block written
- Audit log rows as applicable

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-24 | Cadbury-hq | Phase II Part 3 Wave 2 rewrite: product-type-aware inventory, red-flag escape hatch (Step 3a), baselines confirmation (Step 5a), sacred-lock ordered sub-steps, stack_pack + baselines yaml write-back, phase-transition (Step 5). Prerequisites updated to product-type-aware language. |
| 1.0 | 2026-04-08 | Alfred | Initial stack-locking skill for Phase 3 |
