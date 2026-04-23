---
name: "implementation-readiness"
description: "Gate check — validate all planning documents are complete and consistent before implementation"
type: "workflow"
category: "lifecycle"
phase: 5
agent: "qa"
inputs:
  - "_context/sacred/prd.md"
  - "_context/sacred/architecture.md"
  - "_context/design/ux-design-spec.md"
  - "_context/planning/epics.md"
outputs:
  - artifact: "Readiness Report"
    location: "_context/planning/readiness-report-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Acts as the quality gate between planning and implementation. Validates that the PRD, architecture, UX spec, and epics are complete, internally consistent, and cover all requirements. Produces a readiness assessment: READY, NEEDS WORK, or NOT READY.

## When to Use

- "check implementation readiness"
- "are we ready to build?"
- "readiness gate"
- After completing all Phase 4 and 5 planning work
- Before starting Phase 6 implementation

## Prerequisites

- PRD, architecture doc, and epics must exist
- UX spec recommended but not required

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A readiness report with document inventory, requirement coverage analysis, alignment checks, and overall readiness verdict.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Migrated from bmad-check-implementation-readiness, adapted for coldpress-os |
