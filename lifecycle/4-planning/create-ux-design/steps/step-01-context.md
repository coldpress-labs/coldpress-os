---
step_number: 1
step_name: "Context"
step_goal: "Load PRD and understand users, requirements, and design direction"
halts_for_input: true
next_step: "step-02-flows.md"
---

## Goal

Load all context needed for UX design — PRD requirements, user personas, design brief direction, and technical constraints.

## Instructions

1. **Load PRD:**
   - Read `_context/planning/prd.md` (required)
   - Extract: user personas, feature list, requirements, scope boundaries
   - If PRD not found: halt and recommend running create-prd first

2. **Load design brief:**
   - Read `_context/planning/design-brief-*.md` if available
   - Extract: visual direction, platform requirements, responsive strategy
   - Note design tokens and interaction principles

3. **Understand users:**
   - Map user personas from PRD
   - Identify primary user journeys
   - Note accessibility requirements
   - "What are the 3 most important things a user needs to accomplish?"

4. **Identify design constraints:**
   - Technical constraints from tech-stack.md
   - Platform constraints (web, mobile, responsive requirements)
   - Accessibility requirements (WCAG level)
   - Performance constraints that affect UX (load times, offline support)

5. **Confirm scope:**
   - "Which features should I focus UX design on?" (P0 features minimum)
   - Confirm which user flows to prioritize

## Output

Context loaded, users understood, design scope confirmed. `step_1_complete: true`

## Navigation

-> Proceed to [step-02-flows.md](step-02-flows.md)
