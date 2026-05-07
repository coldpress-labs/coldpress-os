---
step_number: 2
step_name: "Delegate to Creative Storytelling"
step_goal: "Pass framed input package to skills/creative/storytelling; capture authored narratives back"
halts_for_input: true
next_step: "step-03-validate.md"
partial_completion_id: "narrative_step_02"
---

## Goal

Delegate authoring to `skills/creative/storytelling/`. Wrapper-call (in-session) — pass the input package, capture the authored output, structure it into the Phase-5 narrative document.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "narrative_step_02", sub_skill: "delegate_author", at: "started" }`.

### 2. Wrapper-invoke creative `storytelling`

Inside the @ux-designer agent's current session (no fresh @communicator dispatch; Phase-5-internal narrative is part of @ux-designer's scope per decisions log #15), invoke `skills/creative/storytelling/` workflow with the input package from Step 1:

- Pass: `input_package` (from frame step)
- For each `selected_type` in input_package: instruct creative storytelling to author one narrative of that type

User-input halts inside the creative skill workflow are surfaced upward to the user as if direct (no extra agent-dispatch round-trip).

### 3. Capture creative output

Creative `storytelling` produces individual narratives; capture them into the Phase-5 narrative document:

```markdown
## Product Story (origin_story)

<authored content>

## Persona Scenarios

### <Persona Name>

<persona scenario authored content>

(repeat per persona)

## Value-Prop Narrative

<elevator-pitch story>

## Brand Voice Samples

<voice samples in narrative form, grounded in brand-guidelines>

## Feature Stories (if scope_mode == design-led / WDS)

### <Feature Name>

<feature story>
```

### 4. Brand-voice consistency check

After capturing each narrative, verify it uses brand-voice traits + tone register from brand-guidelines. If a narrative drifts from brand voice, surface inline issue and re-prompt creative skill OR adjust manually.

### 5. Partial-completion clean

`at: "narratives_captured"`.

## Output

- All selected narrative types authored and captured into the Phase-5 narrative document
- Brand-voice consistency checked

## Navigation

→ Next: [step-03-validate.md](step-03-validate.md)
