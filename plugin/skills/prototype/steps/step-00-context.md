---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load PRD + ux-design-spec + design-brief + brand-guidelines + tech-stack from graph; existence_checks"
halts_for_input: false
next_step: "step-01-mode-select.md"
partial_completion_id: "prototype_step_00"
---

## Goal

Load Phase 5 prototype context from graph. Verify all prerequisite distillates are validated.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "prototype_step_00", sub_skill: "context_load", at: "started" }`.

### 2. Graph queries (per SKILL.md)

- `prd-v{latest}` — acceptance criteria per user-story → become embedded comments in code-skeleton mode
- `ux-design-spec-v{latest}` — screens + flows + interaction patterns
- `design-brief-v{latest}` — visual direction (background context)
- `brand-guidelines-v{latest}` — tokens (applied to code-skeleton or mock-spec or clickable-html)
- `tech-stack-md` — locked stack; determines code-skeleton output format
- `archetype-mode` — determines default prototype mode (Step 1)

### 3. Existence checks (block on failure)

- `ux-design-spec-v{latest}.validated == true` — block: "Run `ux-design` first; spec must be validated."
- `brand-guidelines-v{latest}.validated == true` — block: "Run `brand-guidelines` first; tokens must be authored."
- `tech-stack-md.locked == true` — block.

### 4. Load full file contents

Cold-read `ux-design-spec-v{latest}.md` (full) and `brand-guidelines-v{latest}.md` (full). These provide the substantive content for Step 2 authoring.

### 5. Partial-completion clean

`at: "graph_loaded"`.

## Output

- All Phase 5 distillate sources loaded and validated
- tech-stack details available for code-skeleton format selection

## Navigation

→ Next: [step-01-mode-select.md](step-01-mode-select.md)
