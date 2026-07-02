---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load design-brief + personas + baselines + tech-stack from graph; existence_checks"
halts_for_input: false
next_step: "step-01-scope.md"
partial_completion_id: "brand_guidelines_step_00"
---

## Goal

Load Phase 5 brand context from graph. Verify prerequisites. Note supersede-check pairs.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "brand_guidelines_step_00", sub_skill: "context_load", at: "started" }`.

### 2. Graph queries (per SKILL.md `inputs.graph_queries`)

- `prd-v{latest}` — voice/tone hints from product description
- `design-brief-v{latest}` — primary visual + voice direction; foundational token feel
- `personas-v{latest}` — voice resonance, accessibility/device targets (drive a11y rules)
- `coldpress-yaml-baselines` — a11y_axis (REQUIRED — drives contrast/keyboard rules)
- `tech-stack-md` — token format strategy (CSS-in-JS / Tailwind / CSS modules / vanilla)
- `archetype-mode` — informs scope (vibe-coder-lean vs standard vs design-led)

### 3. Existence checks (block on failure)

- `design-brief-v{latest}` exists — block: "Run `design-brief` first."
- `baselines.a11y_axis` declared — block: "Token contrast rules need a11y baseline."

### 4. Note supersede-check pairs

- Tokens vs `baselines.a11y_axis` (contrast minimums)
- Voice traits vs `personas` accessibility targets (e.g., overly playful voice may not resonate with formal-domain persona)
- Token format vs `tech-stack.css_strategy` (CSS-in-JS allows runtime theming; Tailwind has constraints)
- Identity (motion) vs `baselines.a11y_axis` (motion-reduce respect)

### 5. Partial-completion clean

`at: "graph_loaded"`.

## Output

- Graph context loaded
- Existence checks passed
- Supersede pairs noted

## Navigation

→ Next: [step-01-scope.md](step-01-scope.md)
