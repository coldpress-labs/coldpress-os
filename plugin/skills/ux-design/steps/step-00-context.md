---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load PRD + design-brief + personas + baselines from graph; existence_checks; supersede-check pair noting"
halts_for_input: false
next_step: "step-01-context.md"
partial_completion_id: "ux_design_step_00"
---

## Goal

Load Phase 5 context from graph. Verify all prerequisites. Note supersede-check pairs for downstream steps.

## Instructions

### 1. Partial-completion write

Write `partial_completion: { step_id: "ux_design_step_00", sub_skill: "context_load", at: "started", resume_token: "<hash>" }`.

### 2. Graph queries (per SKILL.md `inputs.graph_queries`)

Query nodes:
- `prd-v{latest}` — locked, version, last_modified, feature_count, nfr_axes, user_story_ids[]
- `design-brief-v{latest}` — version, content_strategy, brand_voice, visual_direction, platform_a11y_summary
- `personas-v{latest}` — persona archetypes (full), accessibility_targets, device_targets, language_targets
- `idea-validation-v{latest}` — riskiest_assumptions (informs UX-test priority)
- `context-md` — project_shape (governs spec depth)
- `tech-stack-md` — locked stack details (interaction-pattern feasibility)
- `coldpress-yaml-baselines` — a11y_axis (REQUIRED — drives WCAG level)
- `planning-scope` — planning-scope-memo from Phase 4
- `archetype-mode`

### 3. Existence checks (block on failure)

- `prd-v{latest}.locked == true` — block: "PRD not locked; complete Phase 4 first."
- `design-brief-v{latest}` exists — block: "Run `design-brief` first."
- `personas-v{latest}` exists — block: "Phase 2 personas missing."
- `tech-stack-md.locked == true` — block.
- `baselines.a11y_axis` declared — block: "Phase 5 a11y requirements need a baseline target. Re-enter Phase 3 stack-locking baselines block."

### 4. Note supersede-check pairs for Steps 2–4

- UX flows vs `tech-stack.framework` capabilities (e.g., flow needs offline; stack has no service worker)
- Interaction patterns vs `tech-stack.css_strategy` (e.g., gesture-rich UI but Tailwind has no gesture lib)
- A11y specifics vs `baselines.a11y_axis` (UX claim vs declared level)
- Screen content vs PRD user_story_ids coverage (every PRD user story should map to a screen or flow step)

### 5. Partial-completion clean

Update `at: "graph_loaded"`.

## Output

- Graph context loaded; existence_checks passed
- Supersede pairs noted

## Navigation

→ Next: [step-01-context.md](step-01-context.md)
