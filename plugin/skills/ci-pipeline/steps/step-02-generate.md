---
step_number: 2
step_name: "Generate Pipeline"
step_goal: "Create quality pipeline with test stages and gates"
halts_for_input: true
next_step: "step-03-validate.md"
---

## Goal

Generate the CI quality pipeline configuration.

## Instructions

1. **Define pipeline stages:**
   - **Lint & Type Check** — Fast feedback (ESLint, tsc)
   - **Unit Tests** — Run with coverage
   - **Integration Tests** — Run with service dependencies
   - **E2E Tests** — Run in browser environment (if applicable)
   - **Coverage Report** — Aggregate and report

2. **Set quality gates:**
   - Minimum coverage threshold (suggest 80% for new code)
   - All tests must pass (no allowed failures)
   - No type errors
   - Lint clean

3. **Configure reporting:**
   - Coverage comment on PRs
   - Test result summary
   - Failure notifications

4. **Present generated config** for approval.

## User Interaction

Present pipeline YAML and quality gate thresholds for approval.

## Output

Pipeline config ready. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-validate.md](step-03-validate.md)
