---
name: "create-architecture"
description: "Create technical architecture decisions for AI agent consistency"
type: "workflow"
category: "lifecycle"
phase: 4
agent: "architect"
inputs:
  - "_context/sacred/prd.md"
  - "_context/sacred/tech-stack.md"
  - "_context/sacred/context.md"
  - "_context/design/ux-design-spec.md"
outputs:
  - artifact: "Architecture Document"
    location: "_context/sacred/architecture.md"
    format: "markdown"
    sacred: true
version: "1.0"
---

## Purpose

Creates the technical architecture document — a **sacred document** that captures system design, data models, API design, key architecture decision records (ADRs), patterns, and anti-patterns. Designed for AI agent consistency: every agent that reads this document should make the same architectural choices.

## When to Use

- "create architecture"
- "design the architecture"
- "technical architecture"
- After PRD and UX design specification are complete
- When the team needs a definitive technical blueprint before implementation

## Prerequisites

- `_context/sacred/prd.md` exists (sacred document)
- `_context/sacred/tech-stack.md` available (technology decisions)
- `_context/sacred/context.md` available (project constraints)
- UX design specification recommended for interface contracts

## Process

This skill follows a multi-step guided workflow.

-> See [workflow.md](workflow.md) for the full process.

## Output

`_context/sacred/architecture.md` — comprehensive technical architecture document. This is a **sacred document** protected by governance workflows.

## Forcing-function artefacts

> Pattern 3 from `docs/prompt-patterns.md` — mandatory visible artefacts that make skipped analysis reviewable.

Two sections of the output carry FORCING-FUNCTION markers. Skip either and the review (via `@reviewer` rubric in Block EE) will flag the section as fail:

### 1. Component Interaction Diagram (MANDATORY)

Every architecture.md MUST carry a `mermaid graph LR` / `graph TD` block depicting the top-level component interactions. A text-only description of "component A calls component B which queues to C" is INSUFFICIENT. The diagram is the reviewable artefact.

Copy the scaffold from `templates/prompt-snippets/forcing-function-mermaid.md`; fill the nodes + edges with your project's components. Aim for 5-15 top-level nodes; deeper nesting goes in per-component architecture docs (Phase 6 follow-up), not here.

### 2. Failure Mode Enumeration (MANDATORY)

Every architecture.md MUST carry a failure-mode table with at least 5 rows covering the top-3 NFR axes (availability, security, data integrity). Columns: `Scenario` / `Probability` / `Impact` / `Mitigation`. An empty cell is a fail. "unknown — follow-up in sprint N" is an acceptable value; blank is not.

Copy the scaffold from `templates/prompt-snippets/forcing-function-table.md`.

## Output Contract

> Pattern 5 from `docs/prompt-patterns.md`.

You must emit exactly one Markdown document with this structure:

1. `# Architecture — <project.name>` as the first line.
2. YAML frontmatter: `sacred: true`, `version: "1.0"`, `governance: "requires-review"`, `workflowType: "architecture"`, `approvers[]` (at least one named approver per the `architecture_has_approvers` Rego policy in Block Y), `adr_references[]`, `inputDocuments[]` (MUST include the PRD path).
3. Sections 1-N per `templates/documents/architecture.md`, each starting with `## <N>. <Section name>`.
4. The mandatory Component Interaction Diagram (Mermaid) under the Architecture Overview section.
5. The mandatory Failure Mode Enumeration table under the NFR section.
6. Each section opens with the italicised meta-description (Pattern 1).
7. No additional top-level sections. No trailing "Summary" block.

Save to `_context/sacred/architecture.md`. Confirm the save in the chat with the file path and line count.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial create-architecture skill definition |
| 1.1 | 2026-04-24 | Cadbury-hq | Added Forcing-function (Pattern 3 — mandatory Mermaid + failure-mode table) + Output Contract (Pattern 5) sections per §6.7 Block II. |
