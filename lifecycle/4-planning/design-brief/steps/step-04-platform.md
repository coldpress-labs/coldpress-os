---
step_number: 4
step_name: "Platform"
step_goal: "Define platform requirements, responsive strategy, and finalize the design brief"
halts_for_input: true
next_step: null
---

## Goal

Define platform-specific requirements, responsive design strategy, and compile the final design brief document.

## Instructions

1. **Platform requirements:**
   - Target platforms (web, mobile, desktop, etc.)
   - Browser/device support matrix
   - Platform-specific design considerations
   - Progressive enhancement vs. graceful degradation approach

2. **Responsive strategy:**
   - Breakpoint strategy (mobile-first, desktop-first)
   - Layout approach at each breakpoint
   - Component behavior across screen sizes
   - Touch vs. pointer interaction considerations

3. **Accessibility requirements:**
   - WCAG compliance level target (AA, AAA)
   - Screen reader compatibility requirements
   - Keyboard navigation requirements
   - Color blindness considerations

4. **Compile design brief:**
   - Combine all sections: product context, content strategy, visual direction, platform requirements
   - Ensure internal consistency
   - Present to user for review

5. **Finalize and write:**
   - Apply user feedback
   - Save as `_output/planning/design-brief-{date}.md`
   - Include YAML frontmatter with metadata
   - Suggest next step: create-prd

## Output

Final design brief written to `_output/planning/design-brief-{date}.md`. `step_4_complete: true`

## Navigation

Workflow complete. -> Suggest proceeding to `create-prd` skill.
