---
step_number: 1
step_name: "Select Mode"
step_goal: "Determine operation mode and gather agent details"
halts_for_input: true
next_step: "step-02-author.md"
---

## Goal

Determine whether to create, edit, or analyze an agent.

## Instructions

1. **Present mode options:**
   - **(C) Create** — New agent from scratch
   - **(E) Edit** — Modify existing agent definition
   - **(A) Analyze** — Audit all agents for schema compliance and gaps

2. **For Create mode:** Gather the new agent's:
   - Name, slug, title
   - Expertise domain
   - Communication style
   - What skills this agent will own

3. **For Edit mode:** Load existing agent definition.

4. **For Analyze mode:** Load all agents and the roster CSV.

## Output

Mode and details in frontmatter. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-author.md](step-02-author.md)
