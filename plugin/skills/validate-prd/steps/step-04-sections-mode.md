---
step: 4
mode: "sections"
inputs:
  - flag: "--sections"
    type: "comma-separated list"
    example: "US-7,NFR-a11y,Voice-Tone"
output: "_context/planning/prd-validation-amendment-{date}.md"
schema_ref: "schemas/sacred-docs/prd-amendment.schema.json"
---

## Purpose

Sections-mode short-path. Triggered when a downstream phase (5/6/7/8) has accepted a delta into the PRD via `accept_into_prd` and only the affected sections need re-validation. Lighter than the full six-dimension sweep — runs the same checks but scoped to the named sections plus their dependency anchors.

## When this step runs

Selected by Mode Routing at end of Step 0 when `flags.sections` is a non-empty list and `flags.mode` is not explicitly `"full"`.

## Process

### 4.1 — Parse the section list

Parse the `--sections` flag into a list of section IDs. Normalise: trim whitespace, dedupe, validate each ID against the PRD's section index (graph-first preferred via `prd-section-id` node-type, falling back to a structural read of `_context/sacred/prd.md` headings).

Reject (fail-fast) if any section ID does not resolve. Surface the unresolved IDs to the user with a one-line guidance: "validate-prd --sections rejected: 'NFR-perf' not found in PRD section index. Sections available: [list]."

### 4.2 — Resolve dependency anchors

For each named section, identify upstream/downstream dependency anchors that the validation must touch (graph-first, `prd-section -> prd-section` edges; fall back to a regex sweep of cross-section references like "see §" / "per US-X" if graph is stale).

The dependency anchor set is the closure under one hop of dependency edges. Cap at 10 anchors total — if more, surface to user and ask whether to switch to full mode.

### 4.3 — Load scoped content

Read the named sections and dependency anchors from `_context/sacred/prd.md` plus the latest `prd-amendment-{date}.md` if one exists in the same date as this validation (lightweight amendment in flight).

Also re-read the supporting context that the full mode would: `context.md`, `tech-stack.md`, ADR index, baselines, idea-validation. These are not re-validated; they are the comparison surface for this sweep.

### 4.4 — Run the six checks scoped to sections

Run each of the six validation dimensions, but scoped to the named sections + anchors:

| Dimension | Scoped check |
|---|---|
| Completeness | Are required subsections present in each named section? |
| Consistency | Do the named sections contradict each other or their anchors? |
| Testability | Are requirements in named sections phrased as verifiable acceptance criteria? |
| Alignment | Do named sections still align with context.md / tech-stack.md / personas / idea-validation? |
| Feasibility | Are requirements in named sections feasible under current tech-stack + ADRs? |
| Implementability | Is the named-section content broken down enough that Phase 7 can author epics/stories? |

Score each dimension per section. Roll up to a per-section pass/fail/warn. The amendment is `READY` only if every named section is `pass` (or `warn` with explicit user override).

### 4.5 — Cross-check the source delta

Re-read the source delta (delta_id passed by upstream phase, accessible via `_context/handoffs/phase-{from}-design-deltas-wip-{date}.md` or `architecture-deltas-wip` etc.). Confirm that the PRD edit actually addresses the delta's `description` and `evidence`. If the edit and delta don't reconcile, surface as `BLOCKED` — user needs to revise either the edit or the delta's user_decision.

### 4.6 — Emit the amendment validation report

Write `_context/planning/prd-validation-amendment-{date}.md` conforming to `schemas/sacred-docs/prd-amendment.schema.json`. Required content:

- Frontmatter: `schema`, `phase: 4`, `version`, `mode: "sections"`, `triggered_by_phase: <upstream phase>`, `source_delta_id`, `sections_validated[]`, `created_at`, `verdict: READY|NEEDS_REVISION|BLOCKED`.
- Body: per-section assessment table; dependency-anchor check rows; source-delta reconciliation paragraph; recommendation (merge into PRD as v(N+1), or revise, or block).

### 4.7 — Hand back to caller

Return verdict to the calling skill (`phase-transition` step-02a for Phase 5/6/8). On `READY`, the caller proceeds to author the PRD amendment merge. On `NEEDS_REVISION` or `BLOCKED`, the caller surfaces to user via the standard reconciliation 4-option prompt.

## Output Reminders

- File: `_context/planning/prd-validation-amendment-{date}.md`
- Schema: `schemas/sacred-docs/prd-amendment.schema.json`
- Caller integration: `phase-transition/steps/step-02a-reconciliation.md` §B.5 (Phase 6 architecture-deltas) is the first real consumer — the lightweight-amendment path documented there calls this `validate-prd --sections` mode.

## Pattern 7 transitions

This step does not change agent — @pm continues. No transition emitted unless the calling skill has invoked validate-prd as part of a sub_phase_boundary (e.g., during `phase-transition` step-02a §B, where the caller emits a transition record and this skill is invoked synchronously within @pm's sub-context).
