---
step_number: 1
step_name: "Detect Stack"
step_goal: "Identify project tech stack, build commands, and hosting platform"
halts_for_input: true
next_step: "step-02-pipeline-strategy.md"
---

## Goal

Auto-detect the project's framework, build tools, test runner, linter, and hosting platform to inform pipeline generation.

## Instructions

1. **Scan project root** for framework indicators:
   - `package.json` → Node.js ecosystem (check `dependencies` for framework)
   - `next.config.*` → Next.js
   - `vite.config.*` → Vite-based
   - `convex/` directory → Convex backend
   - `Cargo.toml` → Rust
   - `pyproject.toml` / `requirements.txt` → Python

2. **Extract build/test/lint commands** from package.json scripts or equivalent.

3. **Detect hosting platform** from:
   - `vercel.json` → Vercel
   - `netlify.toml` → Netlify
   - `Dockerfile` → Docker/container
   - `fly.toml` → Fly.io
   - `app.yaml` → Google Cloud

4. **Check for monorepo structure:** `turbo.json`, `nx.json`, `pnpm-workspace.yaml`, or `lerna.json`.

5. **Read `_context/sacred/tech-stack.md`** if it exists for authoritative stack decisions.

6. **Present detected stack** to user for confirmation.

## User Interaction

"I detected the following stack: **{framework}** with **{build tool}**, testing via **{test runner}**, deploying to **{platform}**. Monorepo: **{yes/no}**. Is this correct?"

## Output

Update frontmatter with: `framework`, `build_tool`, `test_runner`, `linter`, `hosting`, `monorepo`, `step_1_complete: true`

## Navigation

→ On confirmation, proceed to [step-02-pipeline-strategy.md](step-02-pipeline-strategy.md)
