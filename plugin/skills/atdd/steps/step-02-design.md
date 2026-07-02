---
step_number: 2
step_name: "Design Test Cases"
step_goal: "Map each criterion to one or more executable test cases"
halts_for_input: true
next_step: "step-03-generate.md"
---

## Goal

Design test cases that will verify each acceptance criterion.

## Instructions

1. **For each criterion**, define:
   - Test name (descriptive, behavior-focused)
   - Setup/preconditions (Given)
   - Action (When)
   - Assertion (Then)
   - Edge cases to also cover

2. **Select test type** for each: unit, integration, or E2E based on what the criterion tests.

3. **Present test case designs** for user review before generating code.

## User Interaction

Present test case outlines and ask for approval.

## Output

Test case designs in frontmatter. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-generate.md](step-03-generate.md)
