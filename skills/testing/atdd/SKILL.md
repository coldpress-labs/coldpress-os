---
name: "atdd"
description: "Generate failing acceptance tests from story criteria using Acceptance Test-Driven Development"
type: "workflow"
category: "testing"
agent: "developer"
phases: [6]
inputs:
  - "story file with acceptance criteria"
  - "_context/sacred/tech-stack.md"
outputs:
  - artifact: "Acceptance Tests"
    location: "tests/acceptance/ or co-located with feature"
    format: "test files"
version: "1.0"
---

## Purpose

Implements the ATDD cycle: translates story acceptance criteria into executable, failing tests before implementation begins. Each acceptance criterion becomes one or more test cases that initially fail and pass once the feature is correctly implemented.

## When to Use

- "generate acceptance tests"
- "ATDD for this story"
- "write failing tests for this story"
- Before starting implementation of a story
- When acceptance criteria are well-defined and ready for test translation

## Prerequisites

- Story with clear acceptance criteria in Given/When/Then format
- Test framework already set up (see `test-framework` skill)
- `_context/sacred/tech-stack.md` for test tool selection

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

Executable acceptance test files that fail initially and serve as implementation targets.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New skill combining ATDD patterns with coldpress-os workflow |
