---
step_number: 3
step_name: "Build Context"
step_goal: "Build developer context with technical specifics and guardrails"
halts_for_input: false
next_step: "step-04-finalize.md"
---

## Goal

Construct the developer-facing implementation brief with everything needed to build the story correctly.

## Instructions

1. **Technical requirements:**
   - Specific libraries and versions to use (from tech-stack.md)
   - API endpoints to create or consume
   - Database tables/schema changes needed
   - Environment variables or configuration required
2. **File structure:**
   - Files to create or modify
   - Directory structure to follow
   - Naming conventions from architecture
3. **Library specifics:**
   - Do web research for latest API signatures and best practices for libraries in the stack
   - Note any breaking changes or migration guides relevant to the locked versions
   - Include import statements and usage patterns
4. **Testing requirements:**
   - Unit tests expected
   - Integration test scenarios from acceptance criteria
   - Edge cases to cover
5. **Anti-patterns to avoid:**
   - Common mistakes with the specific libraries
   - Architectural violations to watch for
   - Performance pitfalls relevant to this story
6. **Developer guardrails:**
   - What NOT to do (explicit constraints)
   - Scope boundaries -- what is out of scope for this story
   - Dependencies that must not be introduced

## Output

Complete developer context compiled. `step_3_complete: true`

## Navigation

-> Proceed to [step-04-finalize.md](step-04-finalize.md)
