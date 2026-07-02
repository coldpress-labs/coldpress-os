---
step_number: 2
step_name: "Test Strategy"
step_goal: "Define the testing approach, types, tools, and environments"
halts_for_input: true
next_step: "step-03-coverage.md"
---

## Goal

Establish the testing approach — what types of tests, what tools, what environments, and what the testing pyramid looks like for this project.

## Instructions

1. **Define test pyramid** based on project architecture:
   - Unit test ratio (typically 70%)
   - Integration test ratio (typically 20%)
   - E2E test ratio (typically 10%)
   - Adjust based on project type and risk profile

2. **Select test types** relevant to the project:
   - Unit tests, integration tests, E2E tests
   - API/contract tests
   - Visual regression tests
   - Performance/load tests
   - Security tests
   - Accessibility tests

3. **Identify tools** from the tech stack:
   - Test runner (Jest, Vitest, Playwright, Cypress)
   - Assertion library
   - Mocking framework
   - Coverage tool

4. **Define environment requirements:**
   - Test database setup
   - API mocks or stubs
   - Browser/device matrix for E2E
   - CI/CD test execution

5. **Present strategy** to user for approval.

## User Interaction

Present the proposed test strategy and ask for adjustments.

## Output

Test strategy in frontmatter. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-coverage.md](step-03-coverage.md)
