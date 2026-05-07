---
name: diagram-creator
description: "Emit Mermaid + PlantUML diagrams from architecture.md. Generates: system-context, component, sequence, deployment, and ER diagrams. Embeds Mermaid in markdown for README + architecture.md inline use; emits PlantUML for richer diagrams that benefit from the additional notation."
license: MIT
compatibility: Invoked by @architect in Phase 6
version: "1.0"
---

## Purpose

Phase 6 produces `architecture.md` (sacred) + ADRs but **no diagrams** by default — yet diagrams are how downstream phases (Phase 7 breakdown, Phase 8 implementation, Phase 9 deployment) actually consume the architecture. This skill closes that gap by emitting a standard set of architecture diagrams from the authored architecture.md content + graph relations.

Two formats for two audiences: **Mermaid** (markdown-embedded, README-friendly, GitHub renders inline) for quick reference; **PlantUML** (richer notation, separate files) for diagrams where Mermaid syntax isn't expressive enough (deployment topology, complex sequences, ER models).

## When to Use (Proactive Triggers)

1. Phase 6 exit — once architecture.md is locked, generate the diagram set
2. Architecture amendment — re-run after ADR-driven structural changes
3. User says "draw the architecture" / "diagram the system" / "make a sequence diagram for X"
4. Phase 7 breakdown-entry-sync prerequisite — visual reference for stories
5. README/docs refresh — embed in `_context/sacred/architecture.md` or external README

## Output Artifacts

1. **System-context diagram** (Mermaid `graph LR` or PlantUML C4-context) — actors + system boundary + external dependencies
2. **Component diagram** (Mermaid `graph TB` or PlantUML C4-component) — internal components + relationships from `ArchitectureComponent` graph nodes
3. **Sequence diagram(s)** (Mermaid `sequenceDiagram` or PlantUML) — per critical user flow / API contract; one diagram per major flow
4. **Deployment diagram** (PlantUML, Mermaid limited) — environments + services + data stores + network boundaries; uses `tech-stack.md` runtime targets
5. **ER / data model diagram** (Mermaid `erDiagram` or PlantUML) — when architecture includes data layer; tables + cardinality
6. **Diagram index** at `_context/design/diagrams/index-v{N}.md` — one-line description per diagram + which architecture.md section it visualises

## Prerequisites

- `_context/sacred/architecture.md` exists + locked
- `_context/sacred/architecture.meta.json` sidecar present (component_count drives expected diagram complexity)
- Phase 6 gate passed (otherwise architecture is in flux)
- For ER diagrams: architecture.md has a "Data Model" section (skip silently if not)
- For deployment diagrams: `tech-stack.md` has runtime/host fields filled (skip silently if not)

## Process

→ See [workflow.md](workflow.md) for full process.

1. **Step 1 — Parse architecture.md** for component sections + their inter-relationships
2. **Step 2 — Query graph** for `ArchitectureComponent` nodes + `integrates_with` / `depends_on` edges
3. **Step 3 — Render Mermaid set** (system-context + component + sequence + ER if applicable) into `architecture-mermaid-v{N}.md`
4. **Step 4 — Render PlantUML set** for diagrams that benefit from C4 notation (deployment + complex sequences)
5. **Step 5 — Validate Mermaid** by parsing each fenced ` ```mermaid ` block (catch syntax errors before commit)
6. **Step 6 — Emit diagram index** + cross-reference into architecture.md

## Activation-Gate Checklist

- [ ] At least 1 system-context + 1 component diagram emitted (minimum viable set)
- [ ] All `ArchitectureComponent` nodes appear in component diagram (coverage check)
- [ ] Mermaid syntax valid (each ```mermaid block parses)
- [ ] PlantUML files have correct `@startuml` / `@enduml` framing
- [ ] Diagram index references each emitted diagram with its architecture.md section
- [ ] Sequence diagrams exist for any flow marked CRITICAL in architecture.md NFR section

## Output

Mermaid + PlantUML diagram set under `_context/design/diagrams/v{N}/`. Architecture.md gets a `## Diagrams` section appended (one-line + `![](diagrams/...)` reference). Phase 7 breakdown-entry-sync includes diagrams as graph_queries input for visual reference.

## Mermaid syntax cheat-sheet

```
flowchart LR    — system-context, component
sequenceDiagram — sequence flows
erDiagram       — entity-relationship
classDiagram    — domain model (rare; PlantUML preferred)
gantt           — out of scope (Phase 7 PERT chart skill handles)
```

## PlantUML cheat-sheet

```
@startuml + @enduml    — every file
!include <C4/C4_Context>     — C4 system-context macros
!include <C4/C4_Component>   — C4 component macros
node, database, cloud  — deployment elements
```

## Source Attribution

Pattern adapted from `mhattingpete/claude-skills-marketplace` (Apache-2.0) `architecture-diagram-creator` skill. Implementation original to coldpress-os; integrates with Phase 6 architecture-design output + Phase 7 breakdown-entry-sync graph_queries.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U06) | Initial diagram-creator skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from mhattingpete/claude-skills-marketplace (Apache-2.0). Closes "most surprising gap" from external-skills gap analysis. |
