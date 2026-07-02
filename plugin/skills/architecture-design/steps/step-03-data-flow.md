---
step_number: 3
step_name: "Data Flow + Integration Boundaries"
step_goal: "Author Section 3 (Data Flow) + Section 4 (Integration Boundaries); supersede-check on UX-flow + tech-stack imports; problem_solving Tier-1"
halts_for_input: true
next_step: "step-04-nfr.md"
partial_completion_id: "architecture_design_step_03"
---

## Goal

Author the data flow + integration boundaries. Method playbook Tier-1: `problem_solving` (first_principles, scenario_planning, failure_mode_analysis); `advanced-elicitation` on vague_integration_boundary.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "architecture_design_step_03", sub_skill: "data_flow", at: "started" }`.

### 2. Data flow authoring

For each UX flow (from `ux-design-spec-v{N}` Section 3): trace data through components.

```
### Data Flow: <Flow Name>

UX flow ref: ux-design-spec §3 Flow X
Components touched: <list>
Sequence (Mermaid):

\`\`\`mermaid
sequenceDiagram
    User->>Frontend: <action>
    Frontend->>API: <request>
    API->>Database: <query>
    Database-->>API: <response>
    API-->>Frontend: <data>
    Frontend-->>User: <render>
\`\`\`

State management: <local / global / server / cached>
Error paths: <description>
```

`first_principles` method: for each data-flow, ask "what's the minimum data movement needed to produce the user-observable outcome?"

### 3. Integration boundaries

Prompt:

> **Integration Boundaries.** Based on components + data flow:
>
> - **External integrations:** which third-party services / APIs / databases?
> - **Authentication / authorization boundary:** where does auth live? Edge / API / per-component?
> - **Sync vs async boundaries:** which calls are sync, which async? Why?
> - **Failure isolation:** what happens if external integration fails?
>
> *Tier-1 method: `problem_solving` (failure_mode_analysis) — enumerate failure modes per integration.*

### 4. Supersede-check on UX-flow implementability

For each Mermaid sequenceDiagram: verify it's implementable in current tech-stack. If a flow requires e.g., websockets but tech-stack has no websocket library: surface as `architecture_delta` candidate (forward-carry; flag in handoff log).

### 5. Tech-stack imports verification

For each external library / SDK referenced in components or data flow:
- Check against `tech-stack-md.dependencies` list
- If missing: surface as supersede-check raise — options: (a) scope-reduce architecture; (b) re-enter Phase 3 to amend tech-stack via ADR; (c) flag as architecture-delta requiring Phase 6-internal ADR if Phase 3 amendment is too heavy.

### 6. Advanced-elicitation on vague_integration_boundary

Vague phrases like "loosely coupled", "well-isolated", "service-oriented" without concrete contracts → invoke `advanced-elicitation` (concrete-references / scenario-walkthrough).

### 7. Write into draft

Append `## 3. Data Flow` + `## 4. Integration Boundaries` sections.

### 8. Partial-completion clean

`at: "data_flow_drafted"`.

## Output

- Section 3 (Data Flow) + Section 4 (Integration Boundaries) drafted
- Supersede-checks run; failures surfaced
- Tech-stack imports verified

## Navigation

→ Next: [step-04-nfr.md](step-04-nfr.md)
