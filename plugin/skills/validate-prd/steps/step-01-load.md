---
step_number: 1
step_name: "Load Documents"
step_goal: "Load the PRD and all supporting documents needed for validation"
halts_for_input: true
next_step: "step-02-validate.md"
partial_completion_id: "validate_prd_step_01"
---

## Goal

Load the PRD and every document it should align with. Identify which supporting docs are available and which are missing — missing docs may limit validation scope.

## Instructions

1. **Load the PRD:**
   - Read `_context/sacred/prd.md`
   - If it does not exist, STOP — there is nothing to validate. Suggest `create-prd` instead.
   - Note the PRD version from its frontmatter/version-control panel

2. **Load supporting documents:**
   - `_context/sacred/context.md` — for vision/mission alignment check (required)
   - `_context/sacred/tech-stack.md` — for feasibility check (required)
   - `_context/planning/product-brief.md` — for strategic alignment (if exists)
   - `_context/sacred/architecture.md` — for implementation feasibility (if exists)
   - `_context/design/ux-design-spec.md` — for UI requirement consistency (if exists)

3. **Report loading status:**
   - "Loaded PRD v{X} ({N} sections, {M} requirements)"
   - "Supporting docs: context.md ✓, tech-stack.md ✓, product-brief ✓/✗, architecture ✓/✗, UX spec ✓/✗"
   - "Validation scope: {full / limited — explain what's missing and how it affects validation}"

4. **Confirm with user:**
   - "Ready to validate. Any specific concerns you want me to focus on?"

## Output

PRD and supporting documents loaded. Validation scope determined. `step_1_complete: true`

## Navigation

-> On user confirmation, proceed to [step-02-validate.md](step-02-validate.md)
