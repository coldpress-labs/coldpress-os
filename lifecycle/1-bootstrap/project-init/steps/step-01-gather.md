---
step_number: 1
step_name: "Gather Project Details"
step_goal: "Collect the Phase-1 information needed to scaffold the project. Phase-3+ decisions are deferred."
halts_for_input: true
next_step: "step-02-scaffold.md"
---

## Goal

Collect only the fields that belong in `coldpress.yaml` at project init. Phase-3 decisions (project type, domain, pattern, stack pack, agent modes) are **not** asked here — they are written back by their owning phases as the lifecycle progresses. See [coldpress-yaml-schema.md](../../../../docs/coldpress-yaml-schema.md) for the full schema and per-field ownership.

## Instructions

1. **Ask for project basics:**
   - Project name (human-readable)
   - Project slug (kebab-case, used for directories)

2. **Ask for user details:**
   - User name
   - Communication language (default: English)
   - Document output language (default: English)

3. **Ask for project location:**
   - Create new directory? Or init in current directory?
   - Confirm path before proceeding.

4. **Confirm all details** with user before creating anything.

**Do not ask for:** project type, domain, pattern, stack pack, agent modes. These belong to Phase 2 (Discovery) and Phase 3 (Tech Stack) and are written back to `coldpress.yaml` by those phases' skills. Asking at init re-introduces the "decide now" anti-pattern that the Phase-I bare-yaml redesign removed.

## User Interaction

"Let's set up your project. What's it called?"
Then walk through each Phase-1 question conversationally. If the user volunteers a project type or stack preference, note it verbally ("we'll capture that during discovery / stack selection") but do not write it to the yaml yet.

## Output

Phase-1 project details confirmed. Update frontmatter: `project_name`, `project_slug`, `user_name`, `project_path`, `step_1_complete: true`

## Navigation

→ On confirmation, proceed to [step-02-scaffold.md](step-02-scaffold.md)
