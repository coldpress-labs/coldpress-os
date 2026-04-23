---
name: "test-framework"
description: "Initialize test framework with Playwright, Vitest, or Cypress based on project stack"
type: "workflow"
category: "testing"
agent: "qa"
phases: [6]
inputs:
  - "_context/sacred/tech-stack.md"
  - "package.json"
outputs:
  - artifact: "Test Framework Config"
    location: "project root (config files)"
    format: "various"
  - artifact: "Setup Report"
    location: "_context/testing/framework-setup-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Initializes a test framework for the project — installs dependencies, creates configuration, sets up directory structure, writes example tests, and integrates with the build pipeline.

## When to Use

- "set up testing"
- "initialize test framework"
- "add Playwright/Vitest/Cypress"
- When a project has no test infrastructure
- When migrating to a new test framework

## Prerequisites

- `_context/sacred/tech-stack.md` for framework selection guidance
- `package.json` or equivalent manifest

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

Installed test framework with configuration, directory structure, example tests, and npm scripts.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New skill for coldpress-os testing suite |
