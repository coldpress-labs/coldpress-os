---
step_number: 0
step_name: "Graph-First Context Load"
step_goal: "Load personas + brand-guidelines + idea-validation + product-brief from graph; existence_checks; archetype-skip check"
halts_for_input: false
next_step: "step-01-frame.md"
partial_completion_id: "narrative_step_00"
---

## Goal

Load Phase 5 narrative context. Verify prerequisites. Skip-if archetype-mode is vibe-coder-lean.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "narrative_step_00", sub_skill: "context_load", at: "started" }`.

### 2. Archetype-skip check

Read graph `archetype-mode.mode`. If `vibe-coder-lean`, skip the entire skill (write `narrative-skipped: archetype-vibe-coder-lean` marker into design-deltas WIP log; clear partial_completion; exit cleanly).

### 3. Graph queries

- `personas-v{latest}` — full archetypes (persona scenarios anchor here)
- `brand-guidelines-v{latest}` — voice traits + samples (informs narrative voice)
- `idea-validation-v{latest}` — North Star + value prop (informs product story arc)
- `product-brief-v{latest}` — value prop, positioning
- `prd-v{latest}` — feature stories (optional; used for feature_story type)

### 4. Existence checks

- `personas-v{latest}` exists — block.
- `brand-guidelines-v{latest}` exists — block.

### 5. Cold-read brand-guidelines voice block

Cold-read `_context/design/brand-guidelines-v{latest}.md` — extract Voice + Tone section (full content). This is the voice-context for narrative authoring.

### 6. Partial-completion clean

`at: "graph_loaded"`.

## Output

- Graph context loaded; brand-guidelines voice context cached
- Archetype-skip resolved (proceed or no-op exit)

## Navigation

→ Next: [step-01-frame.md](step-01-frame.md)
