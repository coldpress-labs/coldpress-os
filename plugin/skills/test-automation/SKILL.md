---
name: test-automation
description: Expand test automation coverage for existing features in the codebase
license: MIT
compatibility: Invoked by @developer in Phase 6
version: "1.0"
---

## Purpose

Generates automated tests for existing features that lack test coverage. Analyzes the codebase to find untested code paths, generates appropriate tests (API, E2E, unit), runs them to verify they pass, and produces a coverage summary.

## When to Use

- "generate tests for this feature"
- "add test coverage"
- "automate tests"
- When existing features lack tests
- When coverage metrics need improvement
- When preparing for refactoring (safety net)

## Prerequisites

- Test framework already set up (see `test-framework` skill)
- Features to test must be implemented and working
- Scope: story number, feature name, or file list

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

New test files covering the specified scope, plus a coverage summary report.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-qa-generate-e2e-tests, expanded scope to all test types |
