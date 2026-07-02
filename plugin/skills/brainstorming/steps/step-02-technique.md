---
step_number: 2
step_name: "Technique Selection"
step_goal: "Select brainstorming techniques from the 60+ technique library"
halts_for_input: true
next_step: "step-03-generate.md"
---

## Goal

Choose which creative techniques to use based on the session context.

## Instructions

1. **Load technique library** from `../../../data/methods/brainstorming-techniques.csv`.

2. **Offer selection modes:**
   - **(U) User-selected** — Browse the library by category and pick
   - **(A) AI-recommended** — Get personalized recommendations based on context
   - **(R) Random** — Serendipitous selection from diverse categories
   - **(P) Progressive flow** — Systematic progression through divergent → convergent phases

3. **Present selected techniques** with brief descriptions.

## User Interaction

"How would you like to select techniques? (U)ser-selected / (A)I-recommended / (R)andom / (P)rogressive"

Then present the selected techniques for confirmation.

## Output

Selected techniques in frontmatter. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-generate.md](step-03-generate.md)
