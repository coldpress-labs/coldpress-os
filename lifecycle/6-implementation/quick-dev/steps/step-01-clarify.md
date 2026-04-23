---
step_number: 1
step_name: "Clarify & Spec"
step_goal: "Understand intent, validate scope, and write lightweight spec"
halts_for_input: true
next_step: "step-02-implement.md"
---

## Goal

Ensure we're building the right thing at the right scope.

## Instructions

1. **Classify intent:** Bug fix, new feature, or refactor?
2. **Validate scope:** Single user-facing goal? If too large, suggest splitting or using full dev-story.
3. **Write lightweight spec** (900-1600 tokens) covering: goal, acceptance criteria, technical approach, files to change.
4. **Load `docs/context.md`** for project guardrails.
5. **Present spec** for approval.

## Output

Spec written to `_context/implementation/spec-wip.md`. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-implement.md](step-02-implement.md)
