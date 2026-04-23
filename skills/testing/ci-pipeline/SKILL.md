---
name: "ci-pipeline"
description: "Scaffold CI/CD quality pipeline with test execution, coverage gates, and reporting"
type: "workflow"
category: "testing"
agent: "qa"
phases: [6]
inputs:
  - "_context/sacred/tech-stack.md"
  - "existing test configuration"
  - "../../data/ci-cd/"
outputs:
  - artifact: "CI Quality Pipeline"
    location: ".github/workflows/quality.yml or equivalent"
    format: "yaml"
version: "1.0"
---

## Purpose

Creates a CI/CD quality pipeline focused on test execution — running unit tests, integration tests, E2E tests, coverage reporting, and quality gates on every PR and merge. Complements the `ci-cd-setup` ops skill by focusing specifically on the testing quality layer.

## When to Use

- "set up test pipeline"
- "add tests to CI"
- "create quality gates"
- After setting up test framework, to automate test execution
- When tests exist but aren't running in CI

## Prerequisites

- Test framework already configured (see `test-framework` skill)
- `_context/sacred/tech-stack.md` for platform detection
- CI/CD templates from `../../data/ci-cd/`

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

CI quality pipeline configuration with test execution, coverage reporting, and quality gate enforcement.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New skill for coldpress-os testing suite |
