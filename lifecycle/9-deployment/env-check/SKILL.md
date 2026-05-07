---
name: "env-check"
description: "Validate environment variables before deployment"
type: "router"
category: "lifecycle"
phase: 9
routes_to: "skills/ops/env-check/"
version: "1.0"
---

## Router

→ Read and follow `../../skills/ops/env-check/SKILL.md`

## Phase 7 Context

Before deployment, env-check validates that all environment variables are properly configured and no secrets are committed.
