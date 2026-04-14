---
step_number: 2
step_name: "Analyze Artifacts"
step_goal: "Exhaustive artifact analysis for the target story"
halts_for_input: false
next_step: "step-03-context.md"
---

## Goal

Extract every piece of relevant context from all project artifacts for the target story.

## Instructions

1. **Load and analyze PRD** (`_output/planning/prd.md`):
   - Extract the specific FRs this story implements
   - Note any NFRs that constrain this story (performance, security, accessibility)
   - Identify user personas affected
2. **Load and analyze architecture** (`_output/planning/architecture.md`):
   - Identify components this story touches
   - Note architectural patterns to follow
   - Extract relevant API contracts or data models
3. **Load and analyze UX artifacts** (if they exist):
   - `docs/ux-sitemap.md` -- relevant screens/flows
   - Any wireframes or design specs referenced
4. **Check previous stories** in the same epic:
   - What has already been built?
   - What interfaces or data structures exist?
   - What patterns were established?
5. **Compile a dependency map** for this story: what it requires, what it enables.

## Output

Complete artifact analysis with all relevant context extracted. `step_2_complete: true`

## Navigation

-> Proceed to [step-03-context.md](step-03-context.md)
