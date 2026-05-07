---
step_number: 1
step_name: "Frame Inputs + Select Narrative Types"
step_goal: "Frame inputs for creative storytelling delegation; select narrative types from story-types catalog"
halts_for_input: true
next_step: "step-02-author.md"
partial_completion_id: "narrative_step_01"
---

## Goal

Frame the inputs that will be passed to creative `storytelling`. Select which narrative types to author (subset of story-types catalog).

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "narrative_step_01", sub_skill: "frame_select", at: "started" }`.

### 2. Initialise output document

Create `_context/design/narrative-v{N}.md` with frontmatter:

```yaml
---
schema: schemas/design/narrative.schema.json
phase: 5
version: <N>
sources:
  personas: personas-v{p_version}
  brand_guidelines: brand-guidelines-v{bg_version}
  idea_validation: idea-validation-v{iv_version}
  product_brief: product-brief-v{pb_version}
  prd: prd-v{prd_version}
created_at: <ISO>
status: draft
distillate: true
sacred: false
narrative_types: []
---
```

### 3. Default narrative type set (per archetype)

| archetype | Default types |
|-----------|---------------|
| standard | origin_story, persona_scenario (1 per persona), value_prop_narrative, brand_voice_samples |
| design-led / WDS | + feature_story (top 2-3 features) |
| (vibe-coder-lean was already skipped at Step 0) |

### 4. Confirm with user (override path)

> **Narrative types.** Default for archetype {archetype}: {default_types}.
>
> Confirm or override (full list at `data/methods/story-types.csv`).

Halt for user input. Update frontmatter `narrative_types: [<selected>]`.

### 5. Frame input package

Build the input package that Step 2 will pass to creative `storytelling`:

```yaml
input_package:
  message: "<value prop summary from product-brief>"
  product: "<product description>"
  concept: "<North Star from idea-validation>"
  voice_context: "<voice traits + samples from brand-guidelines>"
  persona_context: "<full personas from personas-v{N}>"
  selected_types: <list>
```

### 6. Partial-completion clean

`at: "framed_and_selected"`.

## Output

- Output document scaffolded with frontmatter
- Narrative types selected (user-confirmed)
- Input package framed for creative storytelling delegation

## Navigation

→ Next: [step-02-author.md](step-02-author.md)
