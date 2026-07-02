---
step_number: 2
step_name: "Story Structure"
step_goal: "Select story type and build the narrative arc"
halts_for_input: true
next_step: "step-03-draft.md"
---

## Goal

Choose the right narrative structure and outline the story.

## Instructions

1. **Load story types** from `../../../data/methods/story-types.csv`.
2. **Recommend story types** based on purpose and audience (Hero's Journey, Before/After, Problem-Solution, etc.).
3. **User selects** a story type.
4. **Build outline** — map key story beats to the selected structure.

## User Interaction

Present recommended story types with examples. Get user selection, then outline.

## Output

Story structure outlined. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-draft.md](step-03-draft.md)
