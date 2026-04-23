---
step_number: 3
step_name: "Wrap Up"
step_goal: "Summarize insights and close the party mode session"
halts_for_input: false
next_step: "complete"
---

## Goal

Gracefully close the discussion with agent farewells, session highlights, and key takeaways.

## Instructions

1. **Agent farewells.** Each active agent gives a brief closing remark in-character (1 sentence each).

2. **Session highlights.** Summarize:
   - Key insights from each agent's perspective
   - Points of agreement across agents
   - Unresolved tensions or trade-offs
   - Surprising or unexpected contributions

3. **Key takeaways.** Extract 3-5 actionable takeaways from the discussion.

4. **Write transcript** to output location with:
   - Session metadata (date, topic, agents active, rounds)
   - Full discussion transcript
   - Highlights and takeaways

5. **Present completion** to user with the transcript location.

## Output

Finalized discussion transcript at `_context/planning/discussions/party-{date}.md`

## Navigation

→ Session complete.
