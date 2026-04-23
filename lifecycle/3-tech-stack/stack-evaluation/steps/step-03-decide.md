---
step_number: 3
step_name: "Decide and Write ADR"
step_goal: "Select the best option and produce an Architecture Decision Record"
halts_for_input: true
next_step: null
---

## Goal

Make the technology decision and document it as a formal ADR.

## Instructions

1. **Present recommendation** — explain which option best fits the requirements and why.
2. **Highlight trade-offs** — what you gain and what you give up.
3. **Ask for user approval** — the user makes the final call.
4. **Write the ADR** with these sections:
   - **Title:** ADR-{NNN}: {Decision Title}
   - **Status:** Accepted
   - **Date:** {date}
   - **Context:** Why this decision was needed
   - **Options Considered:** Summary of each option
   - **Decision:** What was chosen and why
   - **Consequences:** What follows from this decision (positive and negative)
   - **References:** Sources consulted
5. **Save** to `_context/planning/adr-{decision}-{date}.md`

## Output

ADR written and saved. `step_3_complete: true`

## Navigation

→ Workflow complete. Run stack-evaluation again for the next decision, or proceed to stack-locking when all decisions are made.
