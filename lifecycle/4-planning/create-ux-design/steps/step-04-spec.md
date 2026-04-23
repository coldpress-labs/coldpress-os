---
step_number: 4
step_name: "Compile Specification"
step_goal: "Assemble all UX decisions into the final specification document"
halts_for_input: true
next_step: null
---

## Goal

Compile all UX work from Steps 1-3 into a structured specification document that @developer can build from. Load the template, fill every section, verify completeness.

## Instructions

1. **Load the output template:**
   - Read `coldpress-os/templates/documents/ux-design-spec.md`
   - Use it as the structural scaffold

2. **Compile the specification:**
   - Section 1: Design Overview (principles, personas from Step 1)
   - Section 2: Information Architecture (site map, navigation from Step 2)
   - Section 3: User Flows (all flows from Step 2, Mermaid diagrams)
   - Section 4: Key Screens (concepts from Step 3 — one subsection per P0 screen)
   - Section 5: Interaction Patterns (reusable patterns from Step 3)
   - Section 6: Responsive Strategy (breakpoints, layout changes from Steps 1+3)
   - Section 7: Accessibility (WCAG requirements from Step 1)
   - Section 8: Design Tokens (only if full-spec mode — from design brief)

3. **Completeness check:**
   - Every P0 feature in the PRD has at least one screen concept
   - Every user flow has entry/exit points and error states
   - Every screen has default, loading, empty, and error states defined
   - Navigation structure is consistent across all screens
   - Responsive behavior is specified for all key screens
   - No TBD or placeholder content remains

4. **Implementation-readiness check:**
   - Could @developer read this spec and build the UI without guessing?
   - Are component behaviors specific enough? (not just "a form" but "a form with inline validation that shows errors below each field")
   - Are states explicit? (not just "loading state" but "skeleton screen matching the content layout")

5. **Final review with user:**
   - Present the complete specification
   - "Does this capture the UX you envision?"
   - "Any screens or flows missing?"

6. **Write to disk:**
   - Save as `_context/design/ux-design-spec.md`
   - Add version control panel

7. **Signal completion:**
   - Confirm UX specification written
   - Recommend next steps:
     - If architecture not done: `create-architecture`
     - If all Phase 4 complete: Phase 5 `create-epics`
     - Consider `adversarial-review` on the UX spec

## Output

UX design specification written to `_context/design/ux-design-spec.md`. `step_4_complete: true`

## Navigation

Workflow complete. -> Suggest proceeding to remaining Phase 4 skills or Phase 5.
