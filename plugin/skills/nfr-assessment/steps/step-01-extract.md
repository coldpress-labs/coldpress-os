---
step_number: 1
step_name: "Extract NFRs"
step_goal: "Identify and categorize all non-functional requirements"
halts_for_input: true
next_step: "step-02-assess.md"
---

## Goal

Build a complete inventory of NFRs from project documents.

## Instructions

1. **Read PRD** and extract all NFRs, categorizing by type:
   - **Performance** — Response times, throughput, latency thresholds
   - **Security** — Auth requirements, data protection, compliance
   - **Reliability** — Uptime targets, error handling, recovery
   - **Scalability** — User/data growth expectations, horizontal/vertical scaling
   - **Usability** — Accessibility standards, responsiveness, browser support
   - **Maintainability** — Code quality standards, documentation, test coverage

2. **Read architecture doc** for additional quality attributes and constraints.

3. **Identify implicit NFRs** not explicitly stated but expected (e.g., WCAG 2.1 AA for public web apps).

4. **Present inventory** to user for validation.

## User Interaction

"I found **{N}** NFRs across **{N}** categories. {N} are explicit, {N} are implicit. Review?"

## Output

NFR inventory in frontmatter. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-assess.md](step-02-assess.md)
