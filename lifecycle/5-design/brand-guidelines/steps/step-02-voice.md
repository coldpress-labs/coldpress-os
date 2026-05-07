---
step_number: 2
step_name: "Voice + Tone Authoring"
step_goal: "Author voice traits + samples; persona-resonant; brainstorming + story_types brand_voice_samples + advanced-elicitation + editorial-prose"
halts_for_input: true
next_step: "step-03-tokens.md"
partial_completion_id: "brand_guidelines_step_02"
conditional: "skip_if scope_mode == tokens-only"
---

## Goal

Author voice + tone section: 3–5 voice traits with persona-resonant samples. Method playbook Tier-1: `brainstorming` (round_robin, scamper); `story_types` (`brand_voice_samples`); `advanced_elicitation` on vague_voice; `editorial-prose` polish.

## Instructions

### 1. Skip-if check

If `scope_mode == tokens-only` (vibe-coder-lean archetype): skip this step. Update partial_completion `at: "skipped_archetype_lean"` and proceed to Step 3.

### 2. Partial-completion write

`partial_completion: { step_id: "brand_guidelines_step_02", sub_skill: "voice_tone", at: "started" }`.

### 3. Voice direction confirmation

From design-brief Section "Brand Voice": read drafted traits + samples. Confirm with user OR refine via brainstorming.

> **Voice traits (3–5).** From design-brief: {drafted_traits}. Confirm or refine.
>
> Tier-1: `brainstorming` (round_robin) for alternative trait formulations.

### 4. Persona resonance check

For each persona archetype, ask: "Would this voice resonate with this persona?" If no for any persona: surface as design-delta (`delta_type: conflicting`, `recommendation: accept_into_prd` for personas refresh, OR refine voice to bridge personas).

### 5. Voice samples authoring (story_types Tier-1)

Per voice trait, author 2–3 sample sentences. Use `story_types` method `brand_voice_samples`:

```
**Trait: <name>**
- Definition: <1 sentence>
- Sample (formal context): "<sentence>"
- Sample (casual context): "<sentence>"
- Sample (error/empty state): "<sentence>"
```

Sample contexts cover representative product surfaces.

### 6. Advanced-elicitation on vague-voice

If user describes voice with patterns like "playful but professional", "modern", "relatable", invoke `advanced-elicitation` (method `creative-elaboration`) with persona context to extract concrete samples.

### 7. Tone variations

Author tone register table:

| Context | Voice trait emphasis | Notes |
|---------|---------------------|-------|
| Onboarding | warmer | reduce jargon |
| Errors | precise + reassuring | actionable next step always |
| Success | celebratory but brief | avoid emoji-overload |
| Empty states | guiding | hint at next action |
| Help / docs | precise | examples over abstractions |

### 8. Editorial-prose wire-in

Invoke `editorial-prose` against drafted voice + samples. Polish for consistency.

### 9. Write into draft document

Append `## Voice + Tone` section to `_context/design/brand-guidelines-v{N}.md`. Include traits, samples, tone-variations table.

### 10. Partial-completion clean

`at: "voice_tone_drafted"`.

## Output

- Voice + Tone section drafted
- Persona resonance checked
- Editorial polish applied

## Navigation

→ Next: [step-03-tokens.md](step-03-tokens.md)
