---
step_number: 1
step_name: "Gather Project Details"
step_goal: "Collect all information needed to configure the project"
halts_for_input: true
next_step: "step-02-scaffold.md"
---

## Goal

Get the project details from the user before creating anything.

## Instructions

1. **Ask for project basics:**
   - Project name (human-readable)
   - Project slug (kebab-case, used for directories)
   - Project type (web_app, mobile, backend, cli, library — from `data/classification/project-types.csv`)
   - Domain (edtech, fintech, health, etc. — from `data/classification/domain-complexity.csv`)

2. **Ask for user details:**
   - User name
   - Communication language (default: English)
   - Document output language (default: English)

3. **Ask for stack preference:**
   - Stack pack to activate (convex, none for now)
   - Or "I'll decide later" (skip stack pack)

4. **Ask for project location:**
   - Create new directory? Or init in current directory?
   - Confirm path before proceeding.

5. **Confirm all details** with user before creating anything.

## User Interaction

"Let's set up your project. What's it called?"
Then walk through each question conversationally.

## Output

Project details confirmed. Update frontmatter: `project_name`, `project_slug`, `project_type`, `domain`, `user_name`, `stack_pack`, `project_path`, `step_1_complete: true`

## Navigation

→ On confirmation, proceed to [step-02-scaffold.md](step-02-scaffold.md)
