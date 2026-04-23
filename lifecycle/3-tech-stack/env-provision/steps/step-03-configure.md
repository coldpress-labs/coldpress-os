---
step_number: 3
step_name: "Configure Tooling"
step_goal: "Set up linting, formatting, git hooks, editor config, and env template"
halts_for_input: false
next_step: "step-04-verify.md"
---

## Goal

Configure all development tooling so the project enforces consistent code quality from the start.

## Instructions

1. **Linting** — configure ESLint / equivalent with project-appropriate rules:
   - Create config file (`.eslintrc.json`, `eslint.config.js`, etc.)
   - Set up rules matching the project's style preferences
   - Add lint scripts to `package.json`
2. **Formatting** — configure Prettier / equivalent:
   - Create `.prettierrc` with project settings
   - Add format scripts to `package.json`
   - Ensure linting and formatting don't conflict
3. **Git Hooks** — set up pre-commit hooks:
   - Install husky / lint-staged or equivalent
   - Configure pre-commit to run lint + format on staged files
4. **Environment Variables** — create `.env.template`:
   - Document all required environment variables
   - Add `.env` to `.gitignore`
   - Include comments explaining each variable
5. **Editor Config** — create `.vscode/settings.json` or `.editorconfig`:
   - Format on save
   - Default formatter
   - Tab size and style
   - File associations

## Output

All tooling configured. `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-verify.md](step-04-verify.md)
