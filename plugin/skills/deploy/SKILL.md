---
name: deploy
description: Execute deployment to target environment with verification
license: MIT
compatibility: Invoked by @developer in Phase 9
disable-model-invocation: true
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
