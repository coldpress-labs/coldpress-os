---
step_number: 3
step_name: "Lock as Sacred"
step_goal: "Present tech-stack.md for approval and mark as sacred"
halts_for_input: true
next_step: null
---

## Goal

Get user sign-off on the complete tech stack and lock the document as sacred.

## Instructions

1. **Present the full `docs/tech-stack.md`** to the user for review.
2. **Walk through each section** — confirm choices, flag any concerns.
3. **Ask:** "Are you satisfied with this tech stack? Ready to lock it?"
4. **On approval:**
   - Add `sacred: true` to the document's frontmatter
   - Add a lock notice at the top: "This is a sacred document. Changes require explicit revisiting of the relevant ADR."
   - Record the lock date and approver
5. **On rejection:** Note specific concerns and route back to stack-evaluation for the contested decisions.

## Output

`docs/tech-stack.md` locked as sacred. `step_3_complete: true`

## Navigation

→ Workflow complete. Proceed to vibe-coder-setup to configure the development environment.
