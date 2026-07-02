---
step_number: 1
step_name: "Mode Confirmation (Bridge)"
step_goal: "Confirm bridge mode is active (Shape A; standalone removed); set output frontmatter scaffolding"
halts_for_input: false
next_step: "step-02-content.md"
partial_completion_id: "design_brief_step_01"
---

## Goal

Bridge mode is the only mode under Shape A. Step 0 already confirmed product-brief-v{N} + PRD exist via graph. This step formalises the mode in the output document scaffolding and warns if user invoked the skill outside the expected Phase-5-entry path.

## Instructions

### 1. Partial-completion write

Write `partial_completion: { step_id: "design_brief_step_01", sub_skill: "mode_confirm", at: "started" }`.

### 2. Mode confirmation (no user prompt)

Mode is `bridge`. Skip the standalone-vs-bridge prompt that v1.x had — Shape A removes that branch.

### 3. Off-path warning (rare)

If invoked outside Phase-5-entry context (e.g., user explicitly ran `design-brief` without completing Phase 4), warn:

> ⚠️ `design-brief` is the Phase 5 entry skill and expects Phase 4 (PRD lock) to be complete. Step 0 verified PRD locked + personas exist + tech-stack locked. Proceeding in bridge mode. If you wanted design-first archetype path, that's a different entry (out of scope under Shape A v0.3).

### 4. Initialise output document scaffolding

Create `_context/planning/design-brief-v{N}.md` (or open existing if resuming) with frontmatter:

```yaml
---
schema: schemas/design/design-brief.schema.json
phase: 5
version: <N>
mode: bridge
sources:
  prd: prd-v{prd_version}
  product_brief: product-brief-v{pb_version}
  personas: personas-v{p_version}
  idea_validation: idea-validation-v{iv_version}
  tech_stack: tech-stack-v{ts_version}
  baselines: <list of active baseline keys>
  archetype: <archetype-mode>
created_at: <ISO timestamp>
status: draft
distillate: true
---
```

### 5. Partial-completion clean

Update `partial_completion: { step_id: "design_brief_step_01", sub_skill: "mode_confirm", at: "frontmatter_scaffolded" }`.

## Output

- Output document `design-brief-v{N}.md` initialised with frontmatter referencing all input source versions
- Mode confirmed = bridge

## Navigation

→ Next: [step-02-content.md](step-02-content.md)
