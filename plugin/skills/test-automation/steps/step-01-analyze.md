---
step_number: 1
step_name: "Analyze Coverage Gaps"
step_goal: "Identify untested code paths in the specified scope"
halts_for_input: true
next_step: "step-02-generate.md"
---

## Goal

Find what needs tests.

## Instructions

1. **Determine scope** — story, feature, or file list.
2. **Detect existing test framework** and patterns.
3. **Analyze source files** in scope for:
   - Functions/methods with no corresponding tests
   - API routes with no test coverage
   - UI components with no test files
   - Error handling paths never tested
4. **Prioritize gaps** by risk (business-critical paths first).
5. **Present analysis** to user.

## User Interaction

"Found **{N}** untested code paths. Top priorities: {list}. Generate tests for all/selected?"

## Output

Gap analysis in frontmatter. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-generate.md](step-02-generate.md)
