---
name: "deploy"
description: "Execute deployment to target environment with verification"
type: "workflow"
category: "lifecycle"
phase: 9
agent: "developer"
inputs:
  - "_context/sacred/tech-stack.md"
  - "coldpress.yaml"
outputs:
  - artifact: "Deployment Log"
    location: "_context/tracking/deploy-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Executes deployment to the target environment (staging or production) based on the tech stack configuration, verifies the deployment, and logs the results.

## When to Use

- "deploy"
- "ship it"
- "push to production"
- After readiness-check passes

## Prerequisites

- Readiness check: READY TO DEPLOY
- All tests passing
- Tech stack with deployment target configured

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

Deployed application and deployment log.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | New deployment skill for coldpress-os |
