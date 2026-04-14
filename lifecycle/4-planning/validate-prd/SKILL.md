---
name: "validate-prd"
description: "Validate existing PRD against quality standards for completeness, consistency, and testability"
type: "workflow"
category: "lifecycle"
phase: 4
agent: "pm"
inputs:
  - "_output/planning/prd.md"
  - "docs/context.md"
  - "docs/tech-stack.md"
outputs:
  - artifact: "PRD Validation Report"
    location: "_output/planning/prd-validation-{date}.md"
    format: "markdown"
    sacred: false
version: "1.0"
---

## Purpose

Validates an existing PRD against quality standards. Reads the PRD and checks for completeness, internal consistency, testability of requirements, alignment with context.md and tech-stack.md, and overall readiness for implementation.

## When to Use

- "validate PRD"
- "check the PRD"
- "is the PRD ready?"
- After create-prd produces a PRD
- Before proceeding to Phase 5 (Breakdown)
- Whenever the PRD has been significantly edited

## Prerequisites

- `_output/planning/prd.md` exists
- `docs/context.md` available for alignment check
- `docs/tech-stack.md` available for feasibility check

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_output/planning/prd-validation-{date}.md` — validation report with section-by-section assessment, issues found, and recommendations.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial validate-prd skill definition |
