---
name: "create-epics"
description: "Break PRD requirements into user-value-focused epics with acceptance criteria and stories"
type: "workflow"
category: "lifecycle"
phase: 5
agent: "pm"
inputs:
  - "_output/planning/prd.md"
  - "_output/planning/architecture.md"
outputs:
  - artifact: "Epics document"
    location: "_output/planning/epics.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Breaks down PRD functional requirements into user-value-focused epics, each with clear acceptance criteria and decomposed stories. Epics are organized around user value delivery, NOT technical layers. Each story includes Given/When/Then acceptance criteria and is independently completable.

Migrated from: `bmad-create-epics-and-stories` (epic portion).

## When to Use

- "break down the PRD into epics"
- "create epics and stories"
- "decompose requirements into work items"
- "plan the implementation breakdown"
- After PRD and architecture are finalized, before sprint planning

## Prerequisites

- `_output/planning/prd.md` exists and is validated
- `_output/planning/architecture.md` exists and is validated
- Phase 4 (Planning) complete

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

### Key Rules

1. **Epic titles must be user-centric.** Red flag: "Setup Database", "Create API Layer". Good: "User Registration and Onboarding", "Content Discovery Experience".
2. **Epic N cannot require Epic N+1.** Epics must be ordered so each can be completed without depending on later epics.
3. **Stories must be independently completable.** Each story delivers testable value on its own.
4. **Database tables created only when first needed.** No upfront "create all tables" epic. Schema emerges with the stories that need it.
5. **Every FR must map to at least one epic.** No requirements left uncovered.

## Output

`_output/planning/epics.md` containing all epics with their stories, acceptance criteria, and FR traceability.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial create-epics skill for Phase 5, migrated from bmad-create-epics-and-stories |
