---
step_number: 2
step_name: "Decompose"
step_goal: "Break functional requirements into user-value-focused epics"
halts_for_input: true
next_step: "step-03-stories.md"
---

## Goal

Group functional requirements into epics organized by user value delivery, NOT technical layers.

## Instructions

1. **Group FRs by user value.** Identify natural clusters of requirements that deliver coherent user-facing value.
2. **Name epics from the user's perspective.** Each epic title must describe what the user gains.
   - Red flags: "Setup Database", "Create API Layer", "Configure Auth Service"
   - Good: "User Registration and Onboarding", "Content Discovery Experience", "Real-time Collaboration"
3. **Order epics so Epic N never requires Epic N+1.** Each epic can be completed using only what prior epics have built.
4. **Define acceptance criteria** for each epic: what must be true for the epic to be considered done.
5. **Database rule:** Tables and schema are created within the first story that needs them, NOT in a separate "setup" epic.
6. **Present epic breakdown to user** for validation before proceeding.

## Output

Epic list with titles, descriptions, FR mappings, acceptance criteria, and ordering. `step_2_complete: true`

## Navigation

-> Proceed to [step-03-stories.md](step-03-stories.md)
