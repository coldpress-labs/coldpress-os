---
step_number: 5
step_name: "ADR Authoring (Organic + REQUIRED for flagged deltas)"
step_goal: "Author Architecture Decision Records — organic from Steps 2-4 PLUS REQUIRED ADRs queued at Step 1 (silent-divergence guard); editorial Tier-1"
halts_for_input: true
next_step: "step-06-emit.md"
partial_completion_id: "architecture_design_step_05"
---

## Goal

Author all ADRs. Two sources:

1. **Organic ADRs** — significant decisions made during Steps 2–4 (architectural style, component decomposition, integration patterns, NFR strategies).
2. **REQUIRED ADRs** — queued at Step 1 from `architecture_adrs_required[]` (Phase 5 flagged deltas). Each MUST have `resolves_design_delta` field — silent-divergence guard.

Method playbook Tier-1: `problem_solving` (first_principles, failure_mode_analysis); `story_types` (feature_story for ADR rationale narratives); `editorial` for prose polish.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "architecture_design_step_05", sub_skill: "adr_author", at: "started" }`.

### 2. Author REQUIRED ADRs first (silent-divergence guard priority)

For each entry in queued_required_adrs (from Step 1 state), author one ADR at `_context/planning/adrs/adr-NNN-<slug>.md`. NNN = next available ADR number (continue from prior phase ADRs). **Set the schema-required canonical `id: "ADR-NNNN"`** in frontmatter (zero-padded, sequential — continue from the highest `ADR-####` across Phases 3 + 6; VP2 O18). The adr schema requires it and the PRD's `adr_references` point at it — the PostToolUse `schema-validate` hook will reject an ADR without it.

Architecture ADRs use the **same `schemas/planning-artefacts/adr.schema.json` shape as Phase-3 stack ADRs** (VP2 O34 — one ADR schema, not two). An architecture decision is still a decision-with-alternatives, so it carries `options`/`chosen`/`rubric`/`tier` like any ADR; the delta-driven fields (`resolves_design_delta`, …) are additional, documented extras layered on top.

```yaml
---
id: "ADR-NNNN"                 # canonical id (zero-padded, sequential across Phases 3+6) — VP2 O18
name: "adr"                    # schema discriminator (all ADRs)
decision_area: "<architecture concern, e.g. css-token-delivery | client-routing>"
phase_authored: 6
status: "accepted"             # accepted | proposed | superseded
version: "1.0"
tier: "T1"                     # T1 | T2 | T3
derived_from:                  # upstream artefacts this decision rests on
  - "_context/handoffs/phase-5-to-6-<date>.md"
  - "_context/sacred/prd.md"
  - "_context/sacred/tech-stack.md"
options:                       # the alternatives considered
  - "<option A>"
  - "<option B>"
chosen: "<the selected option>"
rubric: { fit: 9, cost: 8, team_familiarity: 7, ecosystem: 8, lock_in: 5, vibe_fit: 8, weighted_total: 7.6 }
supersedes: []
# ── Architecture-ADR extras (REQUIRED for delta-driven ADRs — silent-divergence guard) ──
resolves_design_delta: "<delta_id>"          # REQUIRED on ADRs queued from Phase-5 flagged deltas; OMIT for organic ADRs
prd_section_affected: "<from queued entry>"
architecture_implication: "<from queued entry>"
prd_amendment_deferred_reason: "<from queued entry, if applicable>"
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

Invoke `editorial` against each ADR's prose blocks (Context / Decision / Consequences). User reviews; accept (revise) or reject.

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
- editorial polish applied

## Navigation

→ Next: [step-06-emit.md](step-06-emit.md)
