---
name: "architecture-design"
description: "Phase 6 — author the canonical sacred system architecture (architecture.md) + sidecar + ADRs (incl. REQUIRED ADRs for Phase 5 flagged_for_architecture_ADR deltas — silent-divergence guard). First phase where PRD + UX-spec + brand-guidelines + tech-stack are all simultaneously available."
type: "workflow"
category: "lifecycle"
phase: 6
agent: "architect"
inputs:
  graph_queries:
    - "prd-v{latest}"
    - "ux-design-spec-v{latest}"
    - "design-brief-v{latest}"
    - "brand-guidelines-v{latest}"
    - "tech-stack-md"
    - "coldpress-yaml-baselines"
    - "personas-v{latest}"
    - "idea-validation-v{latest}"
    - "context-md"
    - "legacy-migration-plan-v{latest}"
    - "archetype-mode"
  cold_file_reads:
    - "_context/handoffs/phase-5-to-6-{date}.md"
    - "_context/design/ux-design-spec-v{latest}.md"
    - "_context/design/brand-guidelines-v{latest}.md"
    - "_context/sacred/tech-stack.md"
  existence_checks:
    - "prd-v{latest}.locked == true"
    - "ux-design-spec-v{latest}.validated == true"
    - "brand-guidelines-v{latest}.validated == true"
    - "tech-stack-md.locked == true"
    - "baselines.a11y_axis declared"
    - "phase-5-to-6 handoff exists with valid schema"
outputs:
  - artifact: "Architecture (sacred)"
    location: "_context/sacred/architecture.md"
    format: "markdown"
    sacred: true
    schema: "schemas/sacred-docs/architecture.schema.json"
  - artifact: "Architecture sidecar"
    location: "_context/sacred/architecture.meta.json"
    format: "json"
    schema: "schemas/handoffs/architecture-meta.schema.json"
  - artifact: "ADRs (multiple)"
    location: "_context/planning/adrs/adr-NNN-*.md"
    format: "markdown"
    schema: "schemas/planning-artefacts/adr.schema.json"
    note: "Includes REQUIRED ADRs for every Phase 5 flagged_for_architecture_ADR delta (silent-divergence guard)"
version: "2.0"
---

## Purpose

Phase 6 — convert PRD + UX-spec + brand-guidelines + tech-stack into a sacred system architecture. Architecture is the **first integration moment**: PRD says *what*; UX says *how-it-feels*; brand-guidelines says *visual-language*; tech-stack says *with-what*; architecture says *how-the-pieces-connect*.

Renamed from `create-architecture` per Phase 6 deep-dive Q2 — drops `create-` verb prefix for consistency with `intake`, `personas`, `prototype`, `ux-design`. Relocated from `lifecycle/4-planning/` to `lifecycle/6-architecture/` per Shape A (2026-04-24).

## Silent-divergence guard (CRITICAL)

Phase 5 reconciliation pass may resolve some `design_delta` entries as `flag_for_architecture_ADR` — meaning PRD stays unchanged for that delta but the design diverges and Phase 6 must absorb the delta as an architectural decision. Without enforcement, this divergence is silent.

**Phase 6 enforces** the silent-divergence guard via:
1. Step 1 (`flagged-deltas-intake`) reads `phase-5-to-6 handoff.architecture_adrs_required[]` and queues required ADRs.
2. Step 5 (`adr`) authors REQUIRED ADRs alongside organic ones, each with `resolves_design_delta: <delta_id>` field.
3. Phase 6 exit gate check `architecture-adrs-for-flagged-deltas-emitted` (block-severity) verifies every flagged delta has its corresponding ADR.

The mitigation converts silent PRD↔design divergence into auditable architectural-decision provenance.

## When to Use

- "create architecture"
- "design the architecture"
- "technical architecture"
- Phase 6 — invoked at Phase 6 entry after Phase 5 reconciliation completes.

## Prerequisites

- Phase 5 gate passed (PRD locked, UX-spec validated, brand-guidelines validated, prototype emitted, design-deltas reconciled)
- `tech-stack.md` sacred + locked (Phase 3)
- `coldpress.yaml baselines:` declared
- `phase-5-to-6-{date}.md` handoff written

## Process

7-step guided workflow. Step 0 graph-first. Step 1 NEW flagged-deltas-intake (silent-divergence guard).

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/sacred/architecture.md` — sacred system architecture document. Sections (per template at `templates/documents/architecture.md`): Overview / System Architecture / Component / Data Flow / NFRs / ADR-Index. Schema-validated.

`_context/sacred/architecture.meta.json` — sidecar handoff to Phase 7. Fields: component_count, integration_count, nfr_axes_addressed, adrs_authored, brownfield_modules_handled, flagged_deltas_resolved.

`_context/planning/adrs/adr-NNN-*.md` — Architecture Decision Records. Includes REQUIRED ADRs for flagged deltas (each with `resolves_design_delta` field).

## Architecture-deltas (forward-carry)

Phase 6 may surface PRD/UX gaps at architecture time. These are equivalent to Phase 5's design-deltas. Mechanism extends naturally: surface as `architecture_delta` in handoff log; route through reconciliation pass at Phase 6 exit. Schema reuses `design-delta.schema.json` with `source_skill: architecture-design`. Implementation deferred to Phase 6 implementation Wave 6.X (post-MVP) per decisions log #22.

## Cross-cutting wire-ins

- `adversarial-review` — Step 6 finalisation (challenge architectural assumptions; pre-mortem on integration boundaries)
- `editorial` — Step 6 finalisation (architecture.md structure check)
- `editorial` — Step 5 ADR rationale prose polish
- `advanced-elicitation` — Steps 2, 3, 4 (vague_architectural_pattern / vague_nfr_strategy / vague_integration_boundary triggers)

## Method playbook

`problem_solving` heavy — Steps 3+4+5 (first_principles, failure_mode_analysis, scenario_planning). `advanced_elicitation` heavy. `design_thinking` medium — Step 2 ideate + Step 3 define. `brainstorming` medium. `story_types` low — feature_story for ADR rationale only.

## Forcing-function artefacts

> Pattern 3 from `docs/prompt-patterns.md` (§6.7) — mandatory visible artefacts that make skipped analysis reviewable.

Two sections of the output carry FORCING-FUNCTION markers. Skip either and the `@reviewer` rubric will flag the section as fail:

### 1. Component Interaction Diagram (MANDATORY)

Every architecture.md MUST carry a `mermaid graph LR` / `graph TD` block depicting the top-level component interactions. A text-only description ("component A calls B which queues to C") is INSUFFICIENT. The diagram is the reviewable artefact. Copy the scaffold from `templates/prompt-snippets/forcing-function-mermaid.md`.

### 2. Failure Mode Enumeration (MANDATORY)

Every architecture.md MUST carry a failure-mode table with at least 5 rows covering the top-3 NFR axes. Columns: `Scenario` / `Probability` / `Impact` / `Mitigation`. An empty cell is a fail. Copy the scaffold from `templates/prompt-snippets/forcing-function-table.md`.

## Output Contract

> Pattern 5 from `docs/prompt-patterns.md` (§6.7).

Emit exactly one Markdown document with this structure:

1. `# Architecture — <project.name>` as the first line.
2. YAML frontmatter: `sacred: true`, `version: "1.0"`, `governance: "requires-review"`, `workflowType: "architecture"`, `approvers[]`, `adr_references[]`, `inputDocuments[]` (MUST include the PRD path).
3. Sections 1-N per `templates/documents/architecture.md`, each starting with `## <N>. <Section name>`.
4. The mandatory Component Interaction Diagram (Mermaid) under Architecture Overview.
5. The mandatory Failure Mode Enumeration table under NFR.
6. Each section opens with the italicised meta-description (Pattern 1).

Save to `_context/sacred/architecture.md`. Confirm the save in the chat with the file path and line count.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-30 | Butler (autonomous queue unit #6 Wave 6.2) | Phase 6 rewrite + rename. Skill renamed `create-architecture` → `architecture-design` (drops `create-` prefix per Phase 6 Q2 — consistency with `intake`, `personas`, `prototype`, `ux-design`). Inputs block converted to graph-first structure (graph_queries + cold_file_reads + existence_checks per deep-dive §7b). Inputs expanded to include UX-spec, design-brief, brand-guidelines, personas, idea-validation, baselines, legacy-migration-plan, archetype (was: only PRD, tech-stack, context, ux-design-spec). Outputs upgraded to include ADR list with schema reference + sidecar with new architecture-meta schema. Step 0 (NEW) — graph-first context load + staleness check (5th consumer). Step 1 (NEW) — flagged-deltas-intake — CRITICAL silent-divergence-guard implementation per deep-dive §7.2. Cross-cutting wire-ins documented. Phase tag bumped 4→6 (done in Wave 6.1). Folder relocated `lifecycle/4-planning/create-architecture/` → `lifecycle/6-architecture/architecture-design/` (Wave 6.1 prerequisite move). Architecture-deltas forward-carry mechanism documented. |
| 1.0 | 2026-04-08 | Alfred | Initial create-architecture skill definition |
