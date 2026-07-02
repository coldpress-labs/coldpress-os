---
step_number: 2
step_name: "Install Dependencies"
step_goal: "Install all dependencies specified in the tech stack"
halts_for_input: true
next_step: "step-03-configure.md"
---

## Goal

Get all project dependencies installed and working. This is the generic runtime-install path — stack-pack branches are handled upstream at Step 0 and do not reach this step.

## Instructions

1. **Verify runtime** — confirm the correct version of Node.js / Python / other runtime is available per tech-stack.md.
2. **Initialize project** if not already done (e.g., `pnpm init`, `npm init`).
3. **Install production dependencies** from the tech stack.
4. **Install dev dependencies** — linting, formatting, testing, type-checking tools specified in tech-stack.md.
5. **Verify installation** — run `pnpm ls` / `npm ls` or equivalent; confirm no unresolved peer dependency issues.
6. **Ask user** before running any install commands that modify the filesystem.

On install failure: surface the error and remediation steps. Do NOT silent-degrade or skip dependencies.

## Output

All dependencies installed. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-configure.md](step-03-configure.md)
