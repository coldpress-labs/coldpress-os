---
step_number: 2
step_name: "Discover"
step_goal: "Contextual discovery from existing documents and user interview"
halts_for_input: true
next_step: "step-03-draft.md"
---

## Goal

Gather all necessary context for the product brief through existing documentation and targeted user interview.

## Instructions

1. **Mine existing documents:**
   - Extract product vision from `_context/sacred/context.md`
   - Pull user insights from discovery research
   - Note technology constraints from `_context/sacred/tech-stack.md`
   - Identify gaps that need user input

2. **Targeted interview (Guided mode):**
   - "What problem does this product solve?" (one sentence)
   - "Who is the primary user? Who is the buyer?"
   - "What's the single most important feature?"
   - "How will you measure success in the first 90 days?"
   - "What's your competitive advantage?"

3. **Fill gaps:**
   - Ask only about what's NOT already in existing docs
   - Build on discovery findings rather than re-asking
   - In Autonomous mode: infer from existing docs, flag assumptions

4. **Synthesize:**
   - Organize findings into brief sections: Vision, Users, Value Prop, Key Features, Success Metrics, Strategy

## Output

Discovery findings organized and ready for drafting. `step_2_complete: true`

## Navigation

-> Proceed to [step-03-draft.md](step-03-draft.md)
