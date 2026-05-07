---
name: "db-migration-check"
description: "Validate database migrations before deployment"
type: "router"
category: "lifecycle"
phase: 9
routes_to: "skills/ops/db-migration-check/"
version: "1.0"
---

## Router

→ Read and follow `../../skills/ops/db-migration-check/SKILL.md`

## Phase 7 Context

Before deployment, db-migration-check validates pending migrations are safe and destructive changes are flagged.
