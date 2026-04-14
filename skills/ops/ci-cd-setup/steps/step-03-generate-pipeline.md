---
step_number: 3
step_name: "Generate Pipeline"
step_goal: "Create CI/CD pipeline configuration files"
halts_for_input: true
next_step: "step-04-release-automation.md"
---

## Goal

Generate the actual pipeline configuration based on detected stack and approved strategy.

## Instructions

1. **Load CI/CD templates** from `../../data/ci-cd/` for the selected platform.

2. **Generate pipeline config** tailored to the project:
   - PR workflow (lint + type-check + test + build on every PR)
   - Deploy workflow (build + deploy on merge to main)
   - Scheduled workflows (dependency audit, security scan — weekly)

3. **Include platform-specific configurations:**
   - **Vercel:** Skip deploy steps (Vercel auto-deploys), focus on checks
   - **Docker:** Add image build, push, and container deploy steps
   - **Monorepo:** Add path filtering and selective builds

4. **Never hardcode secrets.** Use `${{ secrets.* }}` references and document required secrets.

5. **Present generated config** to user before writing files.

6. **Write files** only after user approval. Never overwrite existing pipeline configs without confirmation.

## User Interaction

Present the generated YAML and ask: "Write this to `{path}`? (Y/N)"

## Output

Pipeline configuration files written to project. Update frontmatter: `step_3_complete: true`, `files_generated: [list]`

## Navigation

→ Proceed to [step-04-release-automation.md](step-04-release-automation.md)
