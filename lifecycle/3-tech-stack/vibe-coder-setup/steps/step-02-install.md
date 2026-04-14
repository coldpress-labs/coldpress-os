---
step_number: 2
step_name: "Install Dependencies"
step_goal: "Install all dependencies specified in the tech stack"
halts_for_input: true
next_step: "step-03-configure.md"
---

## Goal

Get all project dependencies installed and working.

## Instructions

1. **Verify runtime** — confirm the correct version of Node.js / Python / etc. is available.
2. **Initialize project** if not already done (e.g., `npm init`, `pnpm init`).
3. **Install production dependencies** from the tech stack.
4. **Install dev dependencies** — linting, formatting, testing, type checking tools.
5. **Verify installation** — run `npm ls` or equivalent to confirm no peer dependency issues.
6. **Ask user** before running any install commands that modify the filesystem.

## Output

All dependencies installed. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-configure.md](step-03-configure.md)
