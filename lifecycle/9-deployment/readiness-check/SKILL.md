---
name: "readiness-check"
description: "Deployment readiness gate with 8 quality checks before shipping"
type: "workflow"
category: "lifecycle"
phase: 7
agent: "qa"
inputs:
  - "project source code"
  - "_context/tracking/sprint-status.yaml"
outputs:
  - artifact: "Readiness Report"
    location: "_context/audit/deployment-readiness-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Runs 8 deployment and security readiness gates to verify a completed story or epic is safe to ship. Checks acceptance criteria, compilation, secrets, error handling, debug code, TODOs, accessibility, and build verification.

## When to Use

- "check deployment readiness"
- "ready to ship?"
- "readiness check"
- Before deploying to staging or production
- After completing an epic or milestone

## Prerequisites

- Stories must be in `done` or `review` status
- Project must build successfully

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A readiness report with pass/fail for each of the 8 gates.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Migrated from impl-readiness-check, adapted for coldpress-os |
