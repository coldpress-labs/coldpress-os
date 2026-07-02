---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load PRD + UX-spec + brand-guidelines + tech-stack + baselines + personas + idea-validation + legacy-migration-plan from graph; staleness check; existence_checks"
halts_for_input: false
next_step: "step-01-flagged-deltas-intake.md"
partial_completion_id: "architecture_design_step_00"
---

## Goal

Phase 6 entry. Load full architecture context from graph (populated by Phase 5 phase-transition). Verify all prerequisite distillates are validated.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "architecture_design_step_00", sub_skill: "context_load", at: "started", resume_token: "<hash>" }`. Hash inputs: `(skill_name, step_id, prd_version, ux_spec_version, brand_guidelines_version, tech_stack_version)`.

### 2. Graph queries (per SKILL.md)

- `prd-v{latest}` — locked, version, last_modified, feature_count, nfr_axes, user_story_ids[]
- `ux-design-spec-v{latest}` — validated, screens_count, flows_count, interaction_patterns, a11y_specifics
- `design-brief-v{latest}` — version (background context for design rationale)
- `brand-guidelines-v{latest}` — validated, tokens (especially motion — affects animation library choice), tech_stack_format
- `tech-stack-md` — locked, framework, language, dependencies[], css_strategy
- `coldpress-yaml-baselines` — a11y_axis, perf_axis, seo_axis, observability_axis (if declared)
- `personas-v{latest}` — scale targets (concurrent users, geographic distribution) → drive NFRs
- `idea-validation-v{latest}` — riskiest_assumptions — architecture must enable testing
- `context-md` — project_shape, team_shape — drives architectural pattern (monolith vs microservices etc.)
- `legacy-migration-plan-v{latest}` — brownfield only — keep/refactor/scaffold/reference module decisions
- `archetype-mode` — vibe-coder-lean → simpler architecture spec; design-led/WDS → richer

### 3. Existence checks (block on failure)

- `prd-v{latest}.locked == true` — block: "PRD not locked; complete Phase 4 (or Phase 5 reconciliation) first."
- `ux-design-spec-v{latest}.validated == true` — block: "UX spec not validated; complete Phase 5 first."
- `brand-guidelines-v{latest}.validated == true` — block: "brand-guidelines not validated; complete Phase 5 first."
- `tech-stack-md.locked == true` — block.
- `baselines.a11y_axis declared` — block.
- phase-5-to-6 handoff exists — block.

### 4. Cold file reads

- `phase-5-to-6 handoff` — full content (CRITICAL — `architecture_adrs_required[]` consumed at Step 1)
- `ux-design-spec-v{latest}.md` — full content (drives front-end component identification)
- `brand-guidelines-v{latest}.md` — motion + tokens block (drives motion library + design-system decisions)
- `tech-stack.md` — full content

### 5. Graph-staleness check (5th consumer of helper)

Compare `prd-v{latest}.last_modified` + `ux-design-spec-v{latest}.last_modified` + `brand-guidelines-v{latest}.last_modified` vs phase-5-to-6 handoff written_at. If any input modified AFTER handoff: WARN — graph stale; run `coldpress update` to re-prime.

### 6. Note supersede-check pairs for downstream steps

- Architecture component vs PRD feature (every PRD user-story should map to a component or flow)
- Architecture data flow vs UX flow (UX flows must be implementable)
- Architecture integration vs tech-stack.dependencies (no architecture import outside stack)
- Architecture NFR strategy vs coldpress.yaml baselines
- Architecture decisions vs prior ADRs (supersede-check raises if contradicts)

### 7. Partial-completion clean

Update `at: "graph_loaded"`.

## Output

- All Phase 6 input distillates loaded and validated
- phase-5-to-6 handoff cached (for Step 1 flagged-deltas-intake)
- Graph staleness checked
- Supersede pairs noted

## Navigation

→ Next: [step-01-flagged-deltas-intake.md](step-01-flagged-deltas-intake.md)
