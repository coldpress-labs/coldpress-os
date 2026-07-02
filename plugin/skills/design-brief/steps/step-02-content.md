---
step_number: 2
step_name: "Content Strategy + Brand Voice"
step_goal: "Author content strategy and brand voice section, persona-grounded; brainstorming + advanced-elicitation Tier-1 wire-ins"
halts_for_input: true
next_step: "step-03-visual.md"
partial_completion_id: "design_brief_step_02"
---

## Goal

Author the content strategy + brand voice section of the design brief. Persona-grounded — voice resonates with persona archetypes from Phase 2. Method playbook Tier-1 wire-ins: `brainstorming` (round_robin, what_if_mashup) for voice exploration; `advanced_elicitation` triggered on vague-voice answers.

## Instructions

### 1. Partial-completion write

Write `partial_completion: { step_id: "design_brief_step_02", sub_skill: "content_voice", at: "started" }`.

### 2. Persona grounding (graph-derived)

From Step 0 graph load: read persona archetypes, accessibility/device/language targets. Note any persona traits that constrain voice (e.g., "users are time-pressed clinicians" → voice must be concise, scan-friendly).

### 3. Content strategy authoring

Prompt user (or @ux-designer agent acting):

> **Content strategy.** Based on PRD value prop ({value_prop_summary}) and personas ({persona_summary}):
>
> - **Primary user task per persona:** What does each persona come to do?
> - **Information density preference:** scan-first / read-first / immersive?
> - **Tone register:** transactional / advisory / aspirational / playful?
> - **Reading-level target:** (default: 8th grade unless persona suggests otherwise)
>
> *Tier-1 method: `brainstorming` (round_robin) if user wants to explore alternatives.*

Halt for user input. Capture answers into draft.

### 4. Brand voice authoring

Prompt:

> **Brand voice (3–5 traits + 3 voice samples).** Based on personas and content strategy:
>
> - List 3–5 voice traits (e.g., "warm but precise", "concise", "data-led").
> - For each trait, provide one short sentence sample.
>
> *If answer is "playful but professional" or similar pattern-vague: trigger `advanced-elicitation` (creative-elaboration method) to drill down via concrete persona-scenario.*

### 5. Advanced-elicitation trigger detection

Check user's voice description against vague-voice patterns (regex: phrases like "playful but professional", "modern", "approachable"). If matches: invoke `advanced-elicitation` skill with method `creative-elaboration` + context `{persona, value_prop}`. Capture elicited concrete voice samples.

### 6. Supersede-check (against product-brief)

Compare drafted voice traits vs `product-brief-v{N}.value_prop` and any voice hints in product-brief. If contradicts (e.g., product-brief implies "authoritative expert" but drafted voice is "playful peer"), surface as a `design_delta`:

```yaml
- id: delta-XXX
  source_skill: design-brief
  source_step: step-02-content
  prd_section: "Voice/Tone (implied via product-brief)"
  delta_type: conflicting
  description: "Brand voice traits drafted in design-brief contradict product-brief's implied voice."
  evidence: "product-brief says X; design-brief says Y"
  reconciliation_options: [accept_into_prd, reject, flag_for_architecture_ADR, park_for_phase_11]
  recommendation: accept_into_prd
```

Append to `_context/handoffs/phase-5-design-deltas-wip-{date}.md`.

### 7. Write into draft document

Append a `## Content Strategy` section + `## Brand Voice` section to `_context/planning/design-brief-v{N}.md` draft. Include voice traits + samples + persona-grounding rationale.

### 8. Partial-completion clean

Update `partial_completion: { step_id: "design_brief_step_02", sub_skill: "content_voice", at: "content_voice_drafted" }`.

## Output

- Draft document has Content Strategy + Brand Voice sections
- Any contradictions surfaced as design-deltas in WIP log

## Navigation

→ Next: [step-03-visual.md](step-03-visual.md)
