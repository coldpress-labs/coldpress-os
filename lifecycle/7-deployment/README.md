---
phase: 7
name: "Deployment"
description: "Ship and validate — readiness checks, security, and deployment"
prerequisites:
  - "Phase 6 (Implementation) — stories complete and reviewed"
outputs:
  - "Deployed application"
  - "Readiness and security reports"
next_phase: "8-operate"
---

# Phase 7: Deployment

> Validate everything is safe and ready, then ship.

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [readiness-check](readiness-check/) | workflow | qa | Deployment readiness gate (8 quality checks) |
| [env-check](env-check/) | router | — | → `skills/ops/env-check/` |
| [dep-health-check](dep-health-check/) | router | — | → `skills/ops/dep-health-check/` |
| [security-scan](security-scan/) | router | — | → `skills/ops/security-scan/` |
| [db-migration-check](db-migration-check/) | router | — | → `skills/ops/db-migration-check/` |
| [deploy](deploy/) | workflow | developer | Execute deployment to target environment |

## Recommended Flow

```
readiness-check (gate — must pass)
  ↓
env-check + dep-health-check + security-scan + db-migration-check (parallel)
  ↓
deploy
```

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial Phase 7 definition |
