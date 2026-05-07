---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load full Phase 7 context from graph (14 nodes); 6th-consumer staleness check; existence_checks"
halts_for_input: false
next_step: "step-01-architecture-deltas-reconciliation.md"
partial_completion_id: "breakdown_entry_sync_step_00"
---

## Goal

Phase 7 entry. Single-point context load for all downstream skills.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "breakdown_entry_sync_step_00", sub_skill: "context_load", at: "started", resume_token: "<hash>" }`. Hash inputs: `(skill_name, step_id, prd_version, ux_spec_version, architecture_version, phase_6_handoff_path)`.

### 2. Graph queries (14 nodes per SKILL.md)

Run each `coldpress graph query` invocation below; pipe stdout to `_context/.cache/graph/<query-id>.json`; write a `.meta.json` sidecar (command, cached_at, resume_token, graph_rebuild_at, result_count). If cache exists + valid (per `docs/cross-cutting/graph-first-context.md` cache-invalidation rules), reuse rather than re-query.

```bash
mkdir -p _context/.cache/graph

# 1. PRD content (sections, requirements, features)
coldpress graph query --node-type=PrdSection --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-prd-sections.json

# 2. UX design spec (screens, flows, wireframe refs)
coldpress graph query --node-type=UxScreen --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-ux-screens.json

# 3. Brand guidelines (token nodes)
coldpress graph query --node-type=BrandToken --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-brand-tokens.json

# 4. Architecture sacred-doc (component nodes + integration boundaries)
coldpress graph query --node-type=ArchitectureComponent --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-architecture-components.json

# 5. Tech-stack lock + ADRs (Phase 3 + Phase 6)
coldpress graph query --node-type=TechStackLock --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-tech-stack-lock.json
coldpress graph query --node-type=AdrRecord --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-adrs.json

# 6. coldpress.yaml baselines
coldpress graph query --node-type=Baseline --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-baselines.json

# 7. Personas (primary archetypes)
coldpress graph query --node-type=Persona --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-personas.json

# 8. Idea validation summary (riskiest assumptions)
coldpress graph query --node-type=ValidationSummary --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-validation-summary.json

# 9. Context.md (project goals, problem statement)
coldpress graph query --id=context-md --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-context.json

# 10-11. Brownfield (conditional — skip if no _input/legacy/)
if [ -d "_input/legacy" ]; then
  coldpress graph query --id=legacy-migration-plan-v-latest --format=json \
    > _context/.cache/graph/breakdown-entry-sync-step-00-legacy-migration.json
  if [ -d "_input/legacy/ui" ]; then
    coldpress graph query --id=legacy-ui-assessment-v-latest --format=json \
      > _context/.cache/graph/breakdown-entry-sync-step-00-legacy-ui.json
  fi
fi

# 12. Archetype mode (vibe-coder-lean / standard / design-led / WDS)
coldpress graph query --id=archetype-mode --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-archetype-mode.json

# 13. Prototype manifest (Phase 5 output — files / AC coverage / deltas)
coldpress graph query --id=prototype-manifest-v-latest --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-prototype-manifest.json

# 14. Phase 6 ADRs neighbours (specifically deltas-resolving ADRs)
coldpress graph query --node-type=AdrRecord --relation=resolves_design_delta --format=json \
  > _context/.cache/graph/breakdown-entry-sync-step-00-flagged-delta-adrs.json
```

**Fallback:** if any query fails (graph index missing / corrupt / not yet built), Butler emits a warn — "Graph not available — falling back to cold reads. Run `coldpress graph rebuild` to enable graph-first context." — and cold-reads the corresponding artefacts directly. See `docs/cross-cutting/graph-first-context.md` "Fallback when graph empty / unbuildable".

### 3. Existence checks (block on failure)

- `architecture-md.locked == true` — block
- `prd-v{latest}.locked == true` — block
- `ux-design-spec-v{latest}.validated == true` — block
- `brand-guidelines-v{latest}.validated == true` — block
- `phase-6-to-7 handoff` exists — block

### 4. Cold file reads

- phase-6-to-7 handoff (full content — CRITICAL for Step 1 architecture-deltas extraction)
- `_context/sacred/architecture.md` (full — for downstream skill reference)
- `_context/sacred/architecture.meta.json` (sidecar — component_count, integration_count, flagged_deltas_resolved)

### 5. Graph-staleness check (6th consumer)

Two-axis check:

1. **Source-vs-graph staleness** — compare `_context/sacred/architecture.md` + `_context/design/ux-design-spec-v{latest}.md` + `_context/design/brand-guidelines-v{latest}.md` mtimes vs `.coldpress/graph/index.json` mtime. If any source artefact newer than graph index: WARN — stale graph; run `coldpress graph rebuild`.

2. **Phase-handoff staleness** — compare same artefact mtimes vs phase-6-to-7 handoff `written_at`. If any modified AFTER handoff: WARN — handoff may not reflect latest content; surface to user before proceeding.

The first axis (graph staleness) is the audit-fix #6 wire-in — uses `src/graph/staleness.ts` helper. The second axis is the existing 6th-consumer pattern.

### 6. Note supersede-check pairs for downstream skills

- Stories vs PRD user-stories (coverage)
- Stories vs UX-spec screens (coverage)
- Stories vs architecture components (coverage)
- ADR contradictions (auto-detect)
- Story-tooling vs tech-stack.dependencies

### 7. Partial-completion clean

`at: "graph_loaded"`.

## Output

- 14 graph nodes + handoff log loaded
- Existence checks passed; staleness checked
- Supersede pairs noted

## Navigation

→ Next: [step-01-architecture-deltas-reconciliation.md](step-01-architecture-deltas-reconciliation.md)
