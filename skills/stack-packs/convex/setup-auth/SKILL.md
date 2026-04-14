---
name: "setup-auth"
description: "Set up authentication in a Convex project with Clerk, Auth0, or custom auth"
type: "workflow"
category: "stack-packs/convex"
phases: [6]
inputs:
  - "auth provider preference"
  - "docs/tech-stack.md"
outputs:
  - artifact: "Auth Configuration"
    location: "convex/auth.config.ts and related files"
    format: "typescript"
version: "1.0"
---

## Purpose

Configures authentication for a Convex project — integrates an auth provider (Clerk, Auth0, or custom), sets up Convex auth middleware, creates protected functions, and implements frontend auth flows.

## When to Use

- "set up auth for Convex"
- "add authentication"
- "configure Clerk/Auth0 with Convex"
- When a Convex project needs user authentication

## Prerequisites

- Convex project already initialized (see `quickstart` skill)
- Auth provider account (Clerk, Auth0, etc.) or intent to create one

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

Configured auth with provider integration, Convex middleware, protected functions, and frontend auth UI.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New stack-pack skill for Convex auth setup |
