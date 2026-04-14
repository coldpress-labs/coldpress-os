---
step_number: 1
step_name: "Project Detection"
step_goal: "Classify the project type and select the appropriate scan level"
halts_for_input: true
next_step: "step-02-tech-stack.md"
---

## Goal

Determine what kind of project this is, how complex it is, and how deeply to scan it.

## Instructions

1. **Scan project root** for classification signals:
   - Package manifests (`package.json`, `Cargo.toml`, `pyproject.toml`)
   - Framework config files (`next.config.*`, `vite.config.*`, `angular.json`)
   - Platform indicators (`convex/`, `supabase/`, `prisma/`)
   - Workspace files (`turbo.json`, `nx.json`, `docker-compose.yml`)

2. **Classify project type** using `../../data/classification/documentation-requirements.csv`:
   - web, mobile, backend, cli, library, desktop, game, data, extension, infra, embedded
   - Identify if monorepo (multiple project types)

3. **Assess complexity:**
   - File count and directory depth
   - Number of dependencies
   - Multiple entry points or services
   - Database and API surface area

4. **Present classification** and ask user to select scan level:
   - **(Q) Quick** — High-level overview, key files only (~15 min)
   - **(D) Deep** — Comprehensive scan of all major components (~30 min)
   - **(E) Exhaustive** — File-by-file analysis with deep-dive capability (~60+ min)

5. **Check for existing documentation.** If `_output/docs/` already has content, offer to:
   - Resume from last scan state
   - Start fresh (overwrite)
   - Deep-dive into a specific area

## User Interaction

"I've classified this as a **{type}** project with **{complexity}** complexity. Select scan level: (Q)uick / (D)eep / (E)xhaustive"

## Output

Write initial state file. Update frontmatter: `project_type`, `complexity`, `scan_level`, `step_1_complete: true`

## Navigation

→ Proceed to [step-02-tech-stack.md](step-02-tech-stack.md)
