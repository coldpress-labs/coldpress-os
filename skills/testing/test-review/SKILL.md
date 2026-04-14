---
name: "test-review"
description: "Review test quality using best practices validation and coverage analysis"
type: "simple"
category: "testing"
agent: "qa"
phases: [6]
inputs:
  - "test files to review"
  - "source files being tested"
outputs:
  - artifact: "Test Review Report"
    location: "_output/testing/test-review-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Reviews existing test suites for quality, coverage, and adherence to testing best practices. Identifies fragile tests, missing coverage, poor assertions, and anti-patterns.

## When to Use

- "review tests"
- "check test quality"
- "audit test suite"
- After writing tests, before considering the feature complete
- When tests are failing intermittently (flaky test investigation)
- During test suite maintenance

## Prerequisites

- Test files must exist and be identifiable
- Corresponding source files should be accessible for coverage analysis

## Process

1. **Identify test scope.** Determine which tests to review:
   - Specific test file(s)
   - All tests for a feature/story
   - Entire test suite

2. **Analyze test structure:**
   - Test organization (describe/it blocks, test naming)
   - Setup and teardown patterns (beforeEach, afterAll)
   - Test isolation (shared state, order dependencies)
   - Mocking strategy (over-mocking, under-mocking)

3. **Evaluate assertion quality:**
   - Specific assertions vs. generic (`.toBe` vs. `.toBeTruthy`)
   - Single assertion per test vs. multiple
   - Meaningful error messages
   - Edge case coverage in assertions

4. **Check for anti-patterns:**
   - Hardcoded waits/sleeps (`setTimeout`, `sleep`)
   - Test interdependency (test B requires test A to run first)
   - Snapshot overuse (large snapshots, frequently updated)
   - Testing implementation details instead of behavior
   - Console.log-based "testing" instead of proper assertions
   - Empty catch blocks swallowing test failures

5. **Coverage analysis:**
   - Which code paths are tested
   - Which edge cases are covered
   - Missing negative test cases (what happens when it fails?)
   - Missing boundary conditions

6. **Generate report** with:
   - Overall test quality score (A-F)
   - Findings by category (structure, assertions, anti-patterns, coverage)
   - Specific recommendations with code examples
   - Priority order for improvements

## Output

A test review report with quality assessment, categorized findings, and prioritized recommendations.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New skill for coldpress-os, based on QA patterns from TEA curriculum |
