---
step_number: 0
step_name: "Graph-First Context Load + Entry-Sync Absorption"
step_goal: "Load PRD + personas + product-brief + baselines from graph; staleness check; bridge confirm; brownfield-UI flag; design-deltas WIP log init"
halts_for_input: false
next_step: "step-01-mode.md"
partial_completion_id: "design_brief_step_00"
---

## Goal

Phase 5 entry. Load the full design context from the graph (populated by Phase 4 phase-transition). Absorb the work that would otherwise be a separate `design-entry-sync` skill (per Q1 resolution): graph-staleness check, bridge-mode confirmation, brownfield-UI flag, design-deltas WIP log initialisation.

## Instructions

### 1. Partial-completion write

Write `partial_completion: { step_id: "design_brief_step_00", sub_skill: "context_load", at: "started", resume_token: "<hash>" }` to `coldpress.yaml`. `resume_token` = hash of `(skill_name, step_id, prd_version, design_brief_version)` so input-version changes invalidate resume.

### 2. Graph queries (per SKILL.md `inputs.graph_queries`)

Query graph nodes:

- `prd-v{latest}` — properties: `locked`, `version`, `last_modified`, `feature_count`, `nfr_axes`
- `product-brief-v{latest}` — properties: `version`, `value_prop`, `positioning`, `competitive_context`
- `personas-v{latest}` — properties: `version`, `persona_count`, `accessibility_targets`, `device_targets`, `language_targets`
- `idea-validation-v{latest}` — properties: `north_star`, `riskiest_assumptions`
- `context-md` — properties: `version`, `problem_space`, `project_shape`
- `tech-stack-md` — properties: `version`, `locked`, `framework`, `language`, `css_strategy`
- `coldpress-yaml-baselines` — properties: `a11y_axis`, `seo_axis`, `perf_axis`, `motion_reduce_optin`
- `archetype-mode` — property: `mode` (one of: vibe-coder-lean / standard / design-led / WDS)
- `legacy-input` — property: `has_ui_assets` (boolean) — set by scanning `_input/legacy/` for UI/design files

### 3. Existence checks (block if any fail)

- `prd-v{latest}.locked == true` — if false: ERROR "PRD not locked; complete Phase 4 first."
- `personas-v{latest}` exists — if false: ERROR "Phase 2 personas missing; cannot author design brief without persona grounding."
- `tech-stack-md.locked == true` — if false: ERROR "Phase 3 tech-stack not locked."
- `coldpress.yaml baselines.a11y_axis` declared — if false: WARN "a11y baseline missing; design brief Step 4 (a11y requirements) cannot be precise."

### 4. Graph-staleness check (4th consumer of helper)

Compare `prd-v{latest}.last_modified` vs `_context/handoffs/phase-4-to-5-{date}.md` written_at:

- If PRD modified AFTER handoff written: WARN — graph is stale relative to handoff. Run `coldpress update` to re-prime the graph from disk before continuing.
- If PRD modified at-or-before handoff: graph fresh; proceed.

### 5. Bridge-mode confirmation (graph-based, NOT file-glob)

Confirm bridge mode via graph: product-brief-v{N} node exists AND PRD-v{latest} node exists.

- If both: `mode: bridge` (Shape A guarantees this at Phase 5 entry)
- If product-brief missing: ERROR "Cannot run design-brief without product-brief. Run Phase 2 first."
- If PRD missing: ERROR (caught above by existence check)

Note: Standalone mode is REMOVED in Shape A. Design-first archetypes invoke a different entry path pre-Phase-2 (out of scope).

### 6. Brownfield-UI detection

Read `legacy-input.has_ui_assets`. If `true`, set local flag `legacy_ui_assets_detected: true` for downstream propagation. The conditional `legacy-ui-assessment` skill (Wave 5.7) consumes this flag to decide whether to run.

If unset, scan `_input/legacy/` for files matching: `*.css`, `*.scss`, `*.tsx`, `*.jsx`, `*.figma`, `*.sketch`, `*.tokens.json`, `*.style-guide.md`. If any found: set `legacy_ui_assets_detected: true` and write back to graph.

### 7. Design-deltas WIP log initialisation

Create `_context/handoffs/phase-5-design-deltas-wip-{date}.md` (date = today's ISO date; one file per Phase 5 run):

```markdown
---
schema: schemas/handoffs/design-delta.schema.json
phase: 5
created_at: <ISO timestamp>
status: wip
---

# Phase 5 Design Deltas — Work In Progress

> Aggregated by `phase-transition` at Phase 5 exit. User reviews each delta during reconciliation pass.

## Deltas

(empty — appended by Phase 5 skills as deltas surface)
```

### 8. Note supersede-check pairs for Steps 2–4

Note the following pairs to monitor for divergence in subsequent steps:

- design-brief content claims vs `product-brief-v{N}` value prop
- design-brief brand voice vs persona accessibility/device targets
- design-brief visual direction vs `tech-stack-md.css_strategy` (CSS-in-JS vs Tailwind vs CSS modules — affects token format)
- design-brief platform/a11y vs `coldpress.yaml baselines.a11y_axis` confirmed level

### 9. Partial-completion write (clean state)

Update `partial_completion: { step_id: "design_brief_step_00", sub_skill: "context_load", at: "graph_loaded_brownfield_flagged_deltas_log_initialised" }`.

## Output

- Graph context loaded (PRD, personas, product-brief, idea-validation, baselines, tech-stack, archetype, legacy-input)
- Existence checks passed; graph fresh; bridge mode confirmed
- `legacy_ui_assets_detected` flag set (used by Wave 5.7 conditional skill)
- `_context/handoffs/phase-5-design-deltas-wip-{date}.md` initialised
- Supersede-check pairs noted for Steps 2–4
- Partial-completion mechanic active

## Navigation

→ Next: [step-01-mode.md](step-01-mode.md)
