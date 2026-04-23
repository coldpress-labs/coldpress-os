---
name: "ci-cd-setup"
description: "Generate CI/CD pipeline configuration tailored to the project stack"
type: "workflow"
category: "ops"
phases: [7]
inputs:
  - "_context/sacred/tech-stack.md"
  - "coldpress.yaml"
  - "package.json or equivalent"
outputs:
  - artifact: "CI/CD Pipeline Config"
    location: ".github/workflows/ or equivalent"
    format: "yaml"
  - artifact: "CI/CD Setup Report"
    location: "_context/audit/ops/ci-cd-setup-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Generates production-ready CI/CD pipeline configuration and deployment scripts tailored to the project's tech stack, hosting platform, and branching strategy. Also generates release automation and rollback procedures.

## When to Use

- "set up CI/CD"
- "create pipeline"
- "generate GitHub Actions"
- When a project needs its first CI/CD pipeline
- When migrating to a new CI/CD platform

## Prerequisites

- `_context/sacred/tech-stack.md` must exist (for framework, hosting, and tooling decisions)
- Project must have a buildable codebase with defined scripts

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

CI/CD pipeline configuration files (GitHub Actions, GitLab CI, etc.), release automation scripts, rollback procedure documentation, and a setup report.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from ci-cd-setup, adapted to coldpress-os schema |
