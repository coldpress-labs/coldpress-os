---
step_number: 1
step_name: "Scope (archetype-conditional)"
step_goal: "Read design-brief direction; set archetype-conditional output scope; initialise output document"
halts_for_input: false
next_step: "step-02-voice.md"
partial_completion_id: "brand_guidelines_step_01"
---

## Goal

Read design-brief direction. Set output scope per archetype-mode. Initialise output document scaffolding.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "brand_guidelines_step_01", sub_skill: "scope_init", at: "started" }`.

### 2. Read design-brief direction

Cold-read `_context/planning/design-brief-v{latest}.md` (full content). Extract:
- Brand voice traits + samples (Section: Brand Voice)
- Visual direction mood + foundational token feel (Section: Visual Direction)
- Platform/a11y posture (Section: Platform)

### 3. Determine output scope per archetype

From graph: `archetype-mode.mode`.

| Archetype | Scope | Steps run |
|-----------|-------|-----------|
| `vibe-coder-lean` | tokens-only | Step 3 only (skip 2, 4) |
| `standard` | tokens + voice + a11y rules + identity | All steps |
| `design-led` / `WDS` | extended (full identity + iconography library + token usage examples) | All steps; Step 4 extended |

Set local flag `scope_mode: <one_of_above>` for downstream conditional execution.

### 4. Initialise output document

Create `_context/design/brand-guidelines-v{N}.md` with frontmatter:

```yaml
---
schema: schemas/design/brand-guidelines.schema.json
phase: 5
version: <N>
scope_mode: <mode>
sources:
  design_brief: design-brief-v{db_version}
  personas: personas-v{p_version}
  baselines: <list of active baseline keys>
  tech_stack: tech-stack-v{ts_version}
  archetype: <mode>
created_at: <ISO>
status: draft
distillate: true
sacred: false
---

# Brand Guidelines

(Sections authored by Steps 2-4)
```

### 5. Partial-completion clean

`at: "scope_initialised"`.

## Output

- design-brief direction read
- scope_mode set per archetype
- Output document scaffolded

## Navigation

→ Next: [step-02-voice.md](step-02-voice.md) (skip if scope_mode == tokens-only)
