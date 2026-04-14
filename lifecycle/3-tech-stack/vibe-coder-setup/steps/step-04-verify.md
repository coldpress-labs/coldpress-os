---
step_number: 4
step_name: "Verify Setup"
step_goal: "Run build, lint, and test to confirm the development environment works"
halts_for_input: true
next_step: null
---

## Goal

Prove that everything is wired up correctly and the project is ready for development.

## Instructions

1. **Run lint** — `npm run lint` or equivalent. Fix any configuration issues.
2. **Run format check** — `npm run format:check` or equivalent. Confirm no conflicts.
3. **Run build** — `npm run build` or equivalent. Confirm compilation succeeds.
4. **Run tests** — `npm test` or equivalent. Even if no tests exist yet, confirm the test runner works.
5. **Verify git hooks** — make a test commit to confirm pre-commit hooks fire.
6. **Report results** to user:
   - What passed
   - What failed and why
   - Any manual steps the user needs to complete (e.g., filling in .env values)
7. **On all green:** Congratulate and confirm the project is ready for Phase 4 (Planning).

## Output

Setup verified, project ready to code. `step_4_complete: true`

## Navigation

→ Workflow complete. Phase 3 is done. Proceed to Phase 4: Planning.
