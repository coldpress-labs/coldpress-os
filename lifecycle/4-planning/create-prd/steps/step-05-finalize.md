---
step_number: 5
step_name: "Finalize"
step_goal: "Review, validate, and write the sacred PRD document"
halts_for_input: true
next_step: null
---

## Goal

Compile all sections into the final PRD, validate internal consistency, and write the sacred document.

## Instructions

1. **Compile the PRD:**
   - Assemble all sections: Vision, Requirements, Features
   - Add table of contents
   - Include YAML frontmatter with sacred document metadata:
     ```yaml
     sacred: true
     version: "1.0"
     created: "{date}"
     last_modified: "{date}"
     governance: "requires-review"
     ```

2. **Internal consistency check:**
   - Every requirement traces to a goal
   - Every feature traces to a requirement
   - No contradictions between sections
   - Scope boundaries are respected

3. **Quality check:**
   - All requirements have acceptance criteria
   - All features have user stories
   - Non-functional requirements are specific (not vague)
   - No TBD or placeholder content remains

4. **Final review with user:**
   - Present the complete PRD
   - "Does this fully capture what you want to build?"
   - "Any final changes before this becomes a sacred document?"

5. **Write to disk:**
   - Save as `_context/sacred/prd.md`
   - Mark as sacred in frontmatter
   - Log creation in output metadata

6. **Signal completion:**
   - Confirm sacred document written
   - Suggest next steps: validate-prd, create-ux-design

## Output

Sacred PRD written to `_context/sacred/prd.md`. `step_5_complete: true`

## Navigation

Workflow complete. -> Suggest proceeding to `validate-prd` or `create-ux-design` skill.
