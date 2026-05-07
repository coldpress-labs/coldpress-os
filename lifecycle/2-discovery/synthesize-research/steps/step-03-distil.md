---
step_number: 3
step_name: "Distil"
step_goal: "Invoke the distillator utility to compress the synthesis to LLM-optimised form"
halts_for_input: false
next_step: "step-04-critique.md"
---

## Instructions

### 1. Invoke `distillator`

Skill location: [`skills/utilities/distillator/`](../../../skills/utilities/distillator/).

Pass the working synthesis from Step 2 (themes + tensions + convergent/divergent signals) as input. The distillator does lossless LLM-optimised compression — redundant phrasing collapsed, structure preserved, citations retained.

### 2. Why distillation before critique

Step 4's `adversarial-review` and `editorial-structure` passes work better on a compact draft than a verbose one — critique on a 2-page doc surfaces real bias / weak structure; critique on a 10-page doc surfaces prose nits. Order matters: distil first, then critique.

### 3. Preserve traceability

The distilled form must retain:
- Source citations per theme (distillator's lossless constraint honours this)
- Tension resolution-owner tags (each tension still identifies Phase 3 / Phase 4 arch / etc.)
- Confidence markers per finding (strong / moderate / weak)

Distillator output that strips any of these is broken — re-invoke with instruction to preserve them.

## Output

Compressed synthesis ready for critique. `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-critique.md](step-04-critique.md)
