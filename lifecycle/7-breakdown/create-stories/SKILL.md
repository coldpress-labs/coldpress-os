---
name: "create-stories"
description: "Phase 7 — decompose epics into atomic per-story files with archetype-conditional granularity (per Q5). Each story: file scope + test coverage + acceptance criteria (BDD or AC) + UX screen ref + brand-token use + prototype-manifest reference. Outputs per-story files + stories-index."
type: "workflow"
category: "lifecycle"
phase: 7
agent: "pm"
inputs:
  graph_queries:
    - "breakdown-scope-v{latest}"
    - "epics-v{latest}"
    - "ux-design-spec-v{latest}"
    - "brand-guidelines-v{latest}"
    - "architecture-md"
    - "prototype-manifest"
    - "adrs"
    - "archetype-mode"
    - "legacy-migration-plan-v{latest}"
    - "legacy-ui-assessment-v{latest}"
  cold_file_reads:
    - "_context/planning/epics-v{latest}.md"
    - "_context/design/ux-design-spec-v{latest}.md"
    - "_context/design/brand-guidelines-v{latest}.md"
    - "_context/sacred/architecture.md"
  existence_checks:
    - "epics-v{latest}.validated == true"
    - "ux-design-spec-v{latest}.validated == true"
    - "brand-guidelines-v{latest}.validated == true"
outputs:
  - artifact: "Story files (per-story per Q4)"
    location: "_context/implementation/stories/story-NNN-<slug>-v{N}.md"
    format: "markdown (one file per story)"
    sacred: false
    distillate: true
    schema: "schemas/planning-artefacts/story.schema.json"
  - artifact: "Stories index"
    location: "_context/implementation/stories-index.md"
    format: "markdown"
    schema: "schemas/planning-artefacts/stories-index.schema.json"
version: "2.0"
---

## Purpose

Phase 7 — decompose validated epics into atomic per-story files. Per-story granularity is **archetype-conditional** per Phase 7 deep-dive Q5:

| Archetype | Story granularity | Story types (Tier-1) |
|-----------|-------------------|----------------------|
| vibe-coder-lean | thin (1-3 hours) | acceptance_criteria |
| standard | medium (4-8 hours) | user_stories + bdd_scenarios |
| design-led | medium with explicit UX-screen ref + brand-token use | user_stories + job_stories |
| WDS | medium with full spec | user_stories + bdd_scenarios + acceptance_criteria |

Per Q4: **per-story files** (atomic versioning + parallel authoring + Phase 8 dev-story can lock individual stories) + index file.

## When to Use

- "create stories"
- Phase 7 — invoked after `create-epics` completes.

## Prerequisites

- `epics-v{latest}.md` validated
- `ux-design-spec-v{latest}.md` validated
- `brand-guidelines-v{latest}.md` validated

## Process

5-step workflow.

→ See [workflow.md](workflow.md).

## Output

Per-story files at `_context/implementation/stories/story-NNN-<slug>-v{N}.md` — one file per story. Each story: id, epic_ref, prd_user_story_ids, ux_screen_refs, brand_token_uses, prototype_manifest_files, file_scope, test_coverage_targets, acceptance_criteria (or BDD scenarios), dependencies, estimated_hours, archetype_granularity.

`stories-index.md` aggregates: story_id → status → epic → file paths.

## Cross-cutting wire-ins

- `editorial-structure` — Step 4 finalisation
- `editorial-prose` — story prose polish
- `advanced-elicitation` — vague_acceptance_criteria + vague_story_scope triggers
- `story_types` — Tier-1 per-archetype selection (user_stories / job_stories / bdd_scenarios / acceptance_criteria)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-30 | Butler (autonomous queue unit #9 Wave 7.3) | Phase 7 rewrite. Inputs converted to graph-first; expanded to include UX-spec, brand-guidelines, architecture, prototype-manifest, ADRs, breakdown-scope (was: minimal). Outputs migrated to **per-story files** at `_context/implementation/stories/story-NNN-<slug>-v{N}.md` per Q4 (was: monolithic `_context/implementation/{story-key}.md`). Stories-index.md aggregates. Archetype-conditional granularity per Q5 (4 archetypes × 4 story types). Cross-cutting wire-ins: editorial-prose + editorial-structure + advanced-elicitation + story_types Tier-1. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial create-stories skill |
