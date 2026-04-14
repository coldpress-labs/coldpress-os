---
step_number: 4
step_name: "Synthesize Context"
step_goal: "Compile findings into a lean, LLM-optimized context.md"
halts_for_input: true
next_step: "complete"
---

## Goal

Produce the final `docs/context.md` — optimized for AI agent consumption.

## Instructions

1. **Compile all findings** from Steps 1-3.

2. **Apply distillation principles:**
   - Strip filler and conversational language
   - Dense bullet points over prose
   - Preserve all rules, constraints, and non-obvious patterns
   - Keep numbers, thresholds, and specific requirements exact

3. **Structure context.md** with sections:
   - Project overview (2-3 sentences)
   - Users and value proposition
   - Scope (in/out)
   - Critical rules and constraints
   - Implementation patterns
   - Non-obvious guidelines
   - Version control table

4. **Present to user for review.** This is a sacred document — user must approve.

5. **Write to `docs/context.md`.**

## User Interaction

"Here's the synthesized context document. Please review carefully — this becomes the foundation for all project work. Any changes?"

## Output

`docs/context.md` written. Workflow complete.

## Navigation

→ Workflow complete. Recommend: domain-research, market-research, or → Phase 3.
