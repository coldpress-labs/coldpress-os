---
step_number: 2
step_name: "Write Tech Stack Document"
step_goal: "Write docs/tech-stack.md with all technology decisions"
halts_for_input: false
next_step: "step-03-lock.md"
---

## Goal

Produce the comprehensive, authoritative tech stack document.

## Instructions

1. **Write `docs/tech-stack.md`** with the following sections:
   - **Header:** Project name, date, version
   - **Overview:** High-level summary of the stack philosophy
   - **Frontend:** Framework, UI library, styling approach, state management
   - **Backend:** Runtime, framework, API style (REST/GraphQL/tRPC)
   - **Database:** Engine, ORM/query builder, migration strategy
   - **Authentication:** Provider, strategy (JWT/session), authorization model
   - **Hosting:** Platform, deployment strategy, CDN
   - **Testing:** Unit, integration, E2E frameworks and strategy
   - **CI/CD:** Pipeline tool, deployment automation, environment management
   - **Dev Tools:** Package manager, linting, formatting, git hooks
   - **ADR References:** Links to all source ADRs
2. **For each section,** include: chosen technology, version, rationale (one-liner), and any constraints.
3. **Mark sections as N/A** if not applicable to the project.
4. **Include version control table** at the bottom.

## Output

`docs/tech-stack.md` drafted. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-lock.md](step-03-lock.md)
