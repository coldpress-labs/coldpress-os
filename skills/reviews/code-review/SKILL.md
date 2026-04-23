---
name: "code-review"
description: "Review code changes with parallel review layers and structured triage"
type: "workflow"
category: "reviews"
phases: [6]
inputs:
  - "code diff (staged, uncommitted, branch, or commit range)"
  - "coldpress.yaml"
outputs:
  - artifact: "Code Review Report"
    location: "_context/audit/code-review-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Orchestrates a multi-layered code review using parallel adversarial review techniques: a blind cynical review, an exhaustive edge-case hunt, and (when specs exist) an acceptance criteria audit. Findings are triaged, deduplicated, and presented with actionable resolution options.

## When to Use

- "run code review"
- "review this code"
- "review my changes"
- After implementing a story or feature, before merging
- When validating code quality for a pull request

## Prerequisites

- Code changes must exist (staged, uncommitted, branch diff, or commit range)
- `coldpress.yaml` for project configuration
- Optional: story/spec file for acceptance criteria auditing

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A triaged findings report with findings categorized as: decision_needed, patch, defer, or dismiss. Includes resolution tracking and follow-up options.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-code-review, adapted to coldpress-os schema |
