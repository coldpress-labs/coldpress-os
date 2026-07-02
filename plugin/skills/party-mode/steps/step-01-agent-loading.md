---
step_number: 1
step_name: "Agent Loading"
step_goal: "Load the agent roster and activate all available personas"
halts_for_input: true
next_step: "step-02-discussion.md"
---

## Goal

Build the roster of available agents and introduce them to the user before starting the discussion.

## Instructions

1. **Load agent roster** from `../../../data/agents/agent-roster.csv`.

2. **Build persona roster.** For each agent, extract:
   - Name and title
   - Expertise areas
   - Communication style
   - Role in discussions

3. **Present the party lineup** to the user:
   - List all available agents with their specialties
   - Describe what each brings to the discussion

4. **Get the discussion topic** from the user if not already provided.

5. **Activate party mode** with an enthusiastic introduction from all agents.

## User Interaction

"Welcome to Party Mode! Here's who's at the table: {agent list}. What would you like us to discuss?"

## Output

Update frontmatter with: `agents_active: [list]`, `topic`, `step_1_complete: true`

## Navigation

→ On topic confirmation, proceed to [step-02-discussion.md](step-02-discussion.md)
