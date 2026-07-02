---
name: "data-model"
description: "Phase 6. Entities/relations, migration-zero, seed strategy, and per-entity retention/erasure notes (feeds the DPDPA/GDPR acceptance criteria from P4). Migration-as-story (G5) hangs off this."
type: "simple"
category: "lifecycle"
agent: "architect"
phases: [6]
tools: ["Read", "Write"]
inputs:
  - "_context/sacred/prd.md (§data + §privacy) + architecture.md"
outputs:
  - artifact: "data-model"
    location: "_context/architecture/data-model.yaml"
    format: "yaml"
    schema: "schemas/architecture/p6-artifacts.schema.ts (DataModel)"
version: "1.0"
---

## Purpose

For any project with persistence: model the entities + relations, the zero
migration, the seed strategy, and — crucially — **per-entity retention + erasure**
notes. Those turn the PRD's DPDPA/GDPR consent-and-erasure requirements into
testable acceptance criteria and drive the migration-as-story (G5) breakdown.

## Process

1. List entities with their key fields.
2. For each entity carrying personal data, set `retention` (how long) + `erasure`
   (how it's deleted on request) — these become P4 acceptance criteria.
3. Define `migrations.zero` (the initial schema) + `seed_strategy` (deterministic,
   no production data).

## Output

`_context/architecture/data-model.yaml` — validates against `DataModel`. Migrations
become stories with `blocks` edges to their consumers (forward + rollback both
required; the verifier runs both on a seeded copy).
