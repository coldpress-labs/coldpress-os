---
step_number: 5
step_name: "Review"
step_goal: "Review, refine, validate against schema, write versioned output"
halts_for_input: true
next_step: null
---

## Goal

Finalize the brief via user review, validate against the distillate schema, write the versioned output. Product-brief is a **validated distillate** — block-severity at the Phase 2 gate.

## Instructions

### 1. Collect feedback

- *"Does this accurately capture the product vision?"*
- *"Anything overstated or missing that stakeholders would notice?"*
- *"Are the success metrics (lifted from validation Step 5) the ones you'd actually want to watch?"*
- *"Does the Value Proposition land the differentiation honestly?"*

### 2. Apply refinements

- Incorporate user feedback
- Ensure consistency across sections (e.g., if Value Prop changes, Key Features may need to re-align)
- Verify alignment with `context.md` — no contradictions
- Verify nothing new was authored at brief-time that should have been in Step 1 (Synthesize Research) or `validate-idea`

### 3. Determine output version number

Scan `_context/planning/` for `product-brief-v*.md`:
- None exist → write `v1`
- Latest is `v{N}` → write `v{N+1}`

### 4. Validate frontmatter against the distillate schema

The output must conform to `schemas/distillates/product-brief.schema.json` (ships in Part 2 Wave 4.6 — if schema doesn't exist yet, produce valid-shape frontmatter anyway; validation gates will catch violations later).

Required frontmatter:

```yaml
---
name: product-brief
phase_authored: 2
status: final
tier: distillate
derived_from:
  - _context/sacred/context.md
  - _context/planning/research-synthesis-v{N}.md
  - _context/planning/idea-validation-v{N}.md  # if ran
regeneratable: true
supersedes: []           # populated if supersede-check fired during drafting
version: "1.0"
brief_version: N
---
```

### 5. Run supersede-check (Wave 4 wire-in)

When Step 3's drafting produced a claim that overrides something in `_input/` material directly (e.g., user's initial brief said Gen Z → product-brief says millennials), invoke `src/governance/supersede.ts`. On confirm: add path to `supersedes:` frontmatter array + append row to `_context/audit/supersessions-{date}.md`. Helper lands in Wave 4.1; wire point stubs here in anticipation.

### 6. Write versioned output

Target path: `_context/planning/product-brief-v{N}.md` (not `-{date}.md` — versioned, regeneratable).

### 7. Offer distillate (optional, LLM-optimised)

> Want a 3-5 sentence distillate for quick-reference and LLM consumption?

On yes: invoke [`skills/utilities/distillator/`](../../../skills/utilities/distillator/) on the full brief. Output lands at `_context/planning/product-brief-distillate-v{N}.md`, same version number as the brief.

### 8. Party-mode opt-in (FP19 wire point)

Offer **only** when `team_shape == client-project`:

> Before we send this brief to the client, want all 8 agents to pressure-test it? Catches blind spots before stakeholder eyes. Takes 10-15 extra minutes.

On user confirm: invoke [`skills/utilities/party-mode/`](../../../skills/utilities/party-mode/). Transcript lands at `_context/planning/discussions/party-phase-2-{date}.md`. Party-mode feedback may produce a `v{N+1}` regeneration. **Never auto-run.**

### 9. Signal completion + handoff

- Confirm files written
- Phase 2 exit is owned by `phase-transition` orchestration skill (Wave 4.5) — this step just signals readiness. Butler invokes `phase-transition` after review.
- Do NOT suggest `design-brief` as next (that's Phase 4; product-brief is Phase 2's last workflow skill, not the first Phase 4 skill).

## Output

Final `product-brief-v{N}.md` written + schema-validated. Optional distillate v{N} + party-mode transcript if invoked. `step_5_complete: true`

## Navigation

Workflow complete. Phase 2 → Phase 3 transition handled by `phase-transition` skill.
