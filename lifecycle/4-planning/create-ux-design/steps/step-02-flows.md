---
step_number: 2
step_name: "User Flows"
step_goal: "Map user flows and define information architecture"
halts_for_input: true
next_step: "step-03-wireframes.md"
---

## Goal

Design the user flows for key scenarios and define the information architecture that organizes the product.

## Instructions

1. **Map primary user flows:**
   - For each P0 feature, map the user's journey step-by-step
   - Include: entry point, decision points, success state, error states
   - Use text-based flow notation:
     ```
     [Entry] -> [Action] -> {Decision?} -> [Outcome]
     ```

2. **Map secondary flows:**
   - Onboarding / first-time experience
   - Error recovery flows
   - Edge cases identified in PRD

3. **Information architecture:**
   - Define the navigation structure (top-level pages/sections)
   - Content hierarchy within key pages
   - Relationship between sections (how users move between areas)
   - Search/discovery patterns if applicable

4. **Navigation design:**
   - Primary navigation pattern (sidebar, top nav, bottom nav, etc.)
   - Secondary navigation and breadcrumbs
   - Deep linking and direct access patterns

5. **Review with user:**
   - Walk through primary flows
   - Confirm IA makes sense for the product
   - Identify any missing flows

## Output

User flows mapped and information architecture defined. `step_2_complete: true`

## Navigation

-> Proceed to [step-03-wireframes.md](step-03-wireframes.md)
