---
step_number: 2
step_name: "Detect Statuses"
step_goal: "Determine current status of each work item from existing files"
halts_for_input: false
next_step: "step-03-generate.md"
---

## Goal

Intelligently detect statuses — never downgrade.

## Instructions

1. **Check for existing sprint-status.yaml** — if it exists, load current statuses as baseline.
2. **For each story,** check `_output/implementation/` for story files:
   - File exists with status "done" → `done`
   - File exists with status "review" → `review`
   - File exists with status "in-progress" → `in-progress`
   - File exists (any) → at least `ready-for-dev`
   - No file → `backlog`
3. **For each epic,** derive from story statuses:
   - All stories done → `done`
   - Any story in-progress/review → `in-progress`
   - Otherwise → `backlog`
4. **Never downgrade** a status from a previous sprint-status.yaml.

## Status Flow Reference

- Epic: `backlog` → `in-progress` → `done`
- Story: `backlog` → `ready-for-dev` → `in-progress` → `review` → `done`

## Output

Statuses detected. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-generate.md](step-03-generate.md)
