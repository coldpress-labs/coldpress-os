---
step_number: 2
step_name: "Discussion Orchestration"
step_goal: "Facilitate multi-round agent discussion with user participation"
halts_for_input: true
next_step: "step-03-wrap-up.md"
---

## Goal

Run interactive discussion rounds where agents respond in-character to the topic and each other.

## Instructions

1. **For each user message**, analyze which 2-3 agents are most relevant to respond based on:
   - Expertise alignment with the specific question or statement
   - Agents who haven't spoken recently (ensure rotation)
   - Natural follow-ups to previous agent statements

2. **Generate in-character responses.** Each agent must:
   - Stay true to their defined persona and communication style
   - Reference their specific expertise area
   - Build on or respectfully challenge other agents' points
   - Be concise (2-4 sentences per agent per round)

3. **Enable natural cross-talk.** Agents may:
   - Ask clarifying questions of other agents
   - Agree and extend another agent's point
   - Offer a contrasting perspective
   - Redirect to their area of expertise when relevant

4. **After each round**, present exit option:
   - Continue discussing
   - Redirect to a new sub-topic
   - Wrap up the session

5. **Check for exit triggers:**
   - User says "wrap up", "that's enough", "exit party mode"
   - Discussion has circled back without new insights
   - All relevant perspectives have been heard

## User Interaction

After each round of agent responses, pause for user input or direction.

## Output

Append each round to the transcript. Track rounds completed in frontmatter.

## Navigation

→ On exit trigger, proceed to [step-03-wrap-up.md](step-03-wrap-up.md)
