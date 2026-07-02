---
step_number: 4
step_name: "Alignment Check"
step_goal: "Verify UX, PRD, and Architecture are internally consistent"
halts_for_input: false
next_step: "step-05-assessment.md"
---

## Goal

Catch cross-document contradictions.

## Instructions

1. **UX ↔ PRD alignment:** Do user journeys match use cases? Are all UX features in the PRD?
2. **Architecture ↔ PRD alignment:** Does the architecture support all FRs? Any technical gaps?
3. **Architecture ↔ UX alignment:** Does the architecture support all UX requirements?
4. **If UX spec is missing:** Assess whether UX is implied by the product type. Flag warning if needed.
5. **Document alignment issues** in report.

## Output

Alignment check complete. `step_4_complete: true`

## Navigation

→ Auto-proceed to [step-05-assessment.md](step-05-assessment.md)
