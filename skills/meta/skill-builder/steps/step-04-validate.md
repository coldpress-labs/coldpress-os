---
step_number: 4
step_name: "Validate & Register"
step_goal: "Validate skill against schema and register in catalog"
halts_for_input: true
next_step: "complete"
---

## Goal

Ensure the skill is valid and registered.

## Instructions

1. **Validate SKILL.md** against schema (all required fields present).
2. **Validate workflow.md** if it exists (step index matches actual step files).
3. **Validate step files** (sequential numbering, next_step references valid).
4. **Create skill directory** and write all files.
5. **Present confirmation.** (The skill is auto-discovered by `build:skills`/`check:drift` — no manual catalog to update.)

## Output

Skill registered and files written. Workflow complete.

## Navigation

→ Workflow complete.
