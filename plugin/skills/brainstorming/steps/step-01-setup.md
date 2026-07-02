---
step_number: 1
step_name: "Session Setup"
step_goal: "Initialize brainstorming session with topic and goals"
halts_for_input: true
next_step: "step-02-technique.md"
---

## Goal

Establish the session context — what we're brainstorming about and what success looks like.

## Instructions

1. **Check for existing sessions.** If a prior brainstorming session exists for this topic, offer to continue or start fresh.

2. **Gather session context:**
   - What is the topic or challenge?
   - What constraints exist? (budget, timeline, technology)
   - What has already been tried or considered?
   - What does a great outcome look like?

3. **Initialize output document** with session frontmatter.

## User Interaction

Ask the context questions conversationally. Confirm understanding before proceeding.

## Output

Session context in frontmatter. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-technique.md](step-02-technique.md)
