---
name: "test-design"
description: "Create system-level or epic-level test plans with coverage strategy"
type: "workflow"
category: "testing"
agent: "developer"
phases: [6]
inputs:
  - "_context/sacred/prd.md"
  - "_context/sacred/architecture.md"
  - "_context/planning/epics-and-stories.md"
outputs:
  - artifact: "Test Plan"
    location: "_context/testing/test-plan-{scope}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Creates comprehensive test plans at either system-level (full project) or epic-level scope. Defines test strategy, coverage requirements, test types, environment needs, and acceptance criteria mapping.

## When to Use

- "create test plan"
- "design tests for this epic"
- "test strategy"
- Before implementation begins, to define what will be tested
- When starting a new epic or major feature
- When establishing project-wide testing standards

## Prerequisites

- PRD with functional and non-functional requirements
- Architecture document for technical context
- Epics and stories for scope definition

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A test plan document with test strategy, coverage matrix, test case outlines, environment requirements, and schedule.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New skill for coldpress-os testing suite |
