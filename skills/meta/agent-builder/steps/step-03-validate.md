---
step_number: 3
step_name: "Validate & Register"
step_goal: "Validate against schema and update the agent roster"
halts_for_input: true
next_step: "complete"
---

## Goal

Ensure the agent definition is valid and registered.

## Instructions

1. **Validate** all required frontmatter fields present.
2. **Check** no duplicate agent slugs in roster.
3. **Write** the agent definition file.
4. **Update** `agent-roster.csv` with the new/modified agent.
5. **Present** confirmation to user.

## Output

Agent definition written and roster updated. Workflow complete.

## Navigation

→ Workflow complete.
