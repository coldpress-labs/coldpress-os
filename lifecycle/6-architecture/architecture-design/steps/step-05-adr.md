---
step_number: 5
step_name: "ADR Authoring (Organic + REQUIRED for flagged deltas)"
step_goal: "Author Architecture Decision Records — organic from Steps 2-4 PLUS REQUIRED ADRs queued at Step 1 (silent-divergence guard); editorial-prose Tier-1"
halts_for_input: true
next_step: "step-06-emit.md"
partial_completion_id: "architecture_design_step_05"
---

## Goal

Author all ADRs. Two sources:

1. **Organic ADRs** — significant decisions made during Steps 2–4 (architectural style, component decomposition, integration patterns, NFR strategies).
2. **REQUIRED ADRs** — queued at Step 1 from `architecture_adrs_required[]` (Phase 5 flagged deltas). Each MUST have `resolves_design_delta` field — silent-divergence guard.

Method playbook Tier-1: `problem_solving` (first_principles, failure_mode_analysis); `story_types` (feature_story for ADR rationale narratives); `editorial-prose` for prose polish.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "architecture_design_step_05", sub_skill: "adr_author", at: "started" }`.

### 2. Author REQUIRED ADRs first (silent-divergence guard priority)

For each entry in queued_required_adrs (from Step 1 state), author one ADR at `_context/planning/adrs/adr-NNN-<slug>.md`. NNN = next available ADR number (continue from prior phase ADRs).

```yaml
---
adr_number: NNN
title: "<short architecture decision>"
status: accepted
schema: schemas/planning-artefacts/adr.schema.json
resolves_design_delta: <delta_id>            # CRITICAL — silent-divergence guard field
prd_section_affected: <from queued entry>
design_decision_taken: <from queued entry>
architecture_implication: <from queued entry>
prd_amendment_deferred_reason: <from queued entry>
authored_by: "@architect"
authored_at: <ISO>
phase: 6
---

# ADR-NNN: <Title>

## Context

<The design decision context — what Phase 5 chose; what PRD says; why divergence>

## Decision

<The architectural decision being made to incorporate the design delta>

## Consequences

<Trade-offs; downstream Phase 7-11 implications; what to test in Phase 8>
```

`story_types` Tier-1 (feature_story) for "Decision" + "Consequences" narrative framing.

### 3. Author ORGANIC ADRs

For each significant decision from Steps 2–4 (track as you go; surface here):

```yaml
---
adr_number: NNN+M
title: "<short architecture decision>"
status: accepted
schema: schemas/planning-artefacts/adr.schema.json
authored_by: "@architect"
authored_at: <ISO>
phase: 6
# resolves_design_delta NOT set — organic ADR
---

# ADR-NNN+M: <Title>

## Context
## Decision
## Consequences
```

Common organic ADR topics:
- Architectural style (monolith / microservices / serverless)
- Authentication boundary (edge / API / per-component)
- State management (local / global / server)
- Database choice (within tech-stack constraints)
- Cross-cutting concerns (logging / monitoring / error-handling)

`problem_solving` Tier-1 (first_principles) per ADR: "what's the minimum decision needed; what alternatives did we consider; why this one?".

### 4. Editorial-prose wire-in

Invoke `editorial-prose` against each ADR's prose blocks (Context / Decision / Consequences). User reviews; accept (revise) or reject.

### 5. ADR-Index update in architecture.md

Append/update `## 6. ADR Index` section in architecture.md draft:

```markdown
## 6. ADR Index

| ADR | Title | Resolves Delta | Status |
|-----|-------|----------------|--------|
| ADR-NNN | <title> | <delta-id or —> | accepted |
| ... | ... | ... | ... |
```

### 6. Verify silent-divergence guard

For each entry in queued_required_adrs: verify a corresponding ADR file exists with `resolves_design_delta: <delta_id>` field. If any missing: BLOCK — loop back to Step 5.2 to author missing ADR. Cannot proceed to Step 6 until guard satisfied.

### 7. Partial-completion clean

`at: "adrs_authored: <count_total>, required: <count_required>, organic: <count_organic>"`.

## Output

- All REQUIRED ADRs authored (silent-divergence guard pre-satisfied — final check at Step 6 emit)
- Organic ADRs authored
- ADR Index appended to architecture.md draft
- editorial-prose polish applied

## Navigation

→ Next: [step-06-emit.md](step-06-emit.md)
