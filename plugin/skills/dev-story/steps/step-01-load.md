---
step_number: 1
step_name: "Load Story"
step_goal: "Find the next ready story and load its spec file"
halts_for_input: true
next_step: "step-02-context.md"
---

## Goal

Determine which story to implement.

## Instructions

1. **Check sprint-status.yaml** for stories with status `ready-for-dev` or `in-progress`.
2. **If `in-progress` exists**, resume that story (detect review continuation).
3. **If multiple `ready-for-dev`**, present the next one in sprint order.
4. **If user specifies a story directly**, use that instead.
5. **Load the story spec file** from `_context/implementation/stories/{story-key}.md` (where `story-slice` writes it).
6. **Mark story as `in-progress`** in sprint-status.yaml.

## User Interaction

"Next ready story: **{story-key}: {title}**. Implement this one?"

## Output

Story loaded, status set to in-progress. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-context.md](step-02-context.md)
