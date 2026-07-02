---
step_number: 1
step_name: "Mode Select (archetype-conditional + override)"
step_goal: "Select prototype mode per archetype-mode; allow user override with rationale-logging"
halts_for_input: true
next_step: "step-02-skeleton.md"
partial_completion_id: "prototype_step_01"
---

## Goal

Select prototype output mode. Default per archetype-mode; user may override with rationale.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "prototype_step_01", sub_skill: "mode_select", at: "started" }`.

### 2. Default mode per archetype

| archetype-mode | Default prototype mode |
|----------------|------------------------|
| `vibe-coder-lean` | mock-spec |
| `standard` | code-skeleton |
| `design-led` | clickable-html |
| `WDS` | clickable-html |

Set `default_mode: <derived>` from graph `archetype-mode.mode`.

### 3. Confirm with user (override path)

> **Prototype mode.**
>
> Default per archetype ({archetype-mode}): **{default_mode}**.
>
> Options:
> 1. Confirm default ({default_mode})
> 2. Override:
>    - code-skeleton — tech-stack-coupled component shells (most actionable for Phase 6 + 8)
>    - mock-spec — Mermaid screen diagrams + state lists (stack-agnostic)
>    - clickable-html — HTML/CSS prototype with brand tokens (most tangible for human review)
>
> If override, provide rationale (logged in manifest).

Halt for user input.

### 4. Initialise output directory

Create `_context/design/prototype/{date}/` (date = today's ISO date).

### 5. Initialise manifest

Create `_context/design/prototype/{date}/manifest.json` (will be appended throughout):

```json
{
  "$schema": "schemas/design/prototype-manifest.schema.json",
  "version": 1,
  "created_at": "<ISO>",
  "mode": "<selected_mode>",
  "archetype_assumed": "<archetype-mode>",
  "override_rationale": "<null or user-provided>",
  "sources": {
    "prd": "<v>",
    "ux_design_spec": "<v>",
    "brand_guidelines": "<v>",
    "tech_stack": "<v>"
  },
  "files": [],
  "tech_stack_imports": [],
  "acceptance_criteria_referenced": [],
  "design_deltas_surfaced": 0
}
```

### 6. Partial-completion clean

`at: "mode_selected_and_directory_initialised"`.

## Output

- `mode` selected (default or user-override)
- `_context/design/prototype/{date}/` exists
- `manifest.json` initialised

## Navigation

→ Next: [step-02-skeleton.md](step-02-skeleton.md)
