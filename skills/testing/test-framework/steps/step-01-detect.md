---
step_number: 1
step_name: "Detect & Recommend"
step_goal: "Analyze project stack and recommend the best test framework"
halts_for_input: true
next_step: "step-02-install.md"
---

## Goal

Determine which test framework best fits the project's tech stack.

## Instructions

1. **Check for existing test setup.** If tests already exist, ask whether to:
   - Enhance existing setup
   - Migrate to a new framework
   - Abort (setup not needed)

2. **Analyze stack** from `docs/tech-stack.md` and `package.json`:
   - **React/Next.js** → Vitest + React Testing Library (unit) + Playwright (E2E)
   - **Vue/Nuxt** → Vitest + Vue Test Utils + Playwright (E2E)
   - **Node.js API** → Vitest (unit + integration)
   - **Full-stack** → Vitest (unit) + Playwright (E2E)

3. **Present recommendation** with rationale.

## User Interaction

"Based on your **{framework}** stack, I recommend **{test framework}**. Proceed? (Y/N/Other)"

## Output

Selected framework in frontmatter. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-install.md](step-02-install.md)
