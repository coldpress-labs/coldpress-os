---
step_number: 4
step_name: "Review"
step_goal: "Review, refine, finalize the brief, and offer distillate"
halts_for_input: true
next_step: null
---

## Goal

Finalize the product brief through user review, apply refinements, write to disk, and optionally create a distillate version.

## Instructions

1. **Collect feedback:**
   - "Does this accurately capture your product vision?"
   - "Anything missing, wrong, or overstated?"
   - "Are the success metrics the right ones?"

2. **Apply refinements:**
   - Incorporate all user feedback
   - Ensure consistency across sections
   - Verify alignment with context.md

3. **Write to disk:**
   - Save as `_output/planning/product-brief-{date}.md`
   - Include YAML frontmatter with metadata (date, version, author)

4. **Offer distillate:**
   - "Would you like a one-paragraph distillate version for quick reference?"
   - If yes, create `_output/planning/product-brief-distillate-{date}.md`
   - Distillate is a 3-5 sentence summary of the full brief

5. **Signal completion:**
   - Confirm files written
   - Suggest next step: design-brief

## Output

Final product brief written to `_output/planning/product-brief-{date}.md`. Optional distillate created. `step_4_complete: true`

## Navigation

Workflow complete. -> Suggest proceeding to `design-brief` skill.
