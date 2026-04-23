---
step_number: 2
step_name: "Tech Stack Analysis"
step_goal: "Identify and document the complete technology stack"
halts_for_input: false
next_step: "step-03-directory-scan.md"
---

## Goal

Analyze all dependencies, frameworks, tools, and platforms used in the project.

## Instructions

1. **Read package manifests** and extract:
   - Runtime dependencies with versions
   - Dev dependencies
   - Peer dependencies
   - Scripts and their purposes

2. **Categorize the stack:**
   - **Frontend:** Framework, UI library, state management, routing
   - **Backend:** Runtime, framework, API style (REST, GraphQL, RPC)
   - **Database:** ORM, database type, migration tool
   - **Auth:** Provider, strategy
   - **Testing:** Framework, runners, coverage tools
   - **Build/Deploy:** Bundler, CI/CD, hosting platform
   - **Dev Tools:** Linter, formatter, type checker

3. **Identify key patterns:**
   - TypeScript or JavaScript
   - Monorepo or single package
   - Server-side rendering, static generation, or SPA
   - Serverless or traditional server

4. **Write `_context/docs/tech-stack.md`** immediately with findings.

## Output

Tech stack documentation written to `_context/docs/tech-stack.md`. Update frontmatter: `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-directory-scan.md](step-03-directory-scan.md)
