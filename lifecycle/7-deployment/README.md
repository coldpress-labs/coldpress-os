---
phase: 7
name: "Deployment"
description: "Ship and validate — severity-weighted readiness gate, deploy, smoke-test, rollback-on-fail"
prerequisites:
  - "Phase 6 (Implementation) exit conditions met (all stories green, coverage threshold hit, QA sign-off)"
  - "Deployment target identified — environment, platform, credentials"
outputs:
  - "Deployed application"
  - "Readiness report at `_context/audit/deployment-readiness-{date}.md`"
  - "Security scan at `_context/audit/security-scan-{date}.md`"
  - "Deploy log at `_context/tracking/deploy-{date}.md`"
next_phase: "8-operate"
---

# Phase 7: Deployment

> Validate then ship. The readiness gate is **severity-weighted** — not every check blocks. Security HIGH findings block; env / dep / db-migration warnings route to the user rather than auto-halting.

## Entry conditions

Phase 7 starts when all of:

1. Phase 6 (Implementation) exit conditions met.
2. Deployment target identified — which environment (sandbox / staging / live), which platform, whose credentials.
3. Rollback plan documented in the current sprint's change log (even if trivial — "revert the merge commit" is a rollback plan).

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [readiness-check](readiness-check/) | workflow | qa | **Severity-weighted gate.** 8 quality checks with per-check severity. |
| [env-check](env-check/) | router | qa | → `skills/ops/env-check/` — envvar / config drift vs target env. Warn-level unless a required key is missing. |
| [dep-health-check](dep-health-check/) | router | qa | → `skills/ops/dep-health-check/` — dependency CVE + EOL check. Warn-level unless a HIGH-severity CVE sits in a runtime path. |
| [security-scan](security-scan/) | router | qa | → `skills/ops/security-scan/` — OWASP-informed security analysis. **HIGH severity = block.** |
| [db-migration-check](db-migration-check/) | router | qa | → `skills/ops/db-migration-check/` — migration safety + rollback-path validation. Block-level when a migration has no safe rollback. |
| [deploy](deploy/) | workflow | developer | Execute deployment to the target environment. Invokes smoke-test post-deploy. |

## Severity-weighted readiness gate

Plan §4.3 directive: **not every finding blocks.** Treating every warning as a hard gate trains people to ignore warnings; treating nothing as a gate means HIGH findings ship. The weighted approach:

| Check | Block threshold | Warn threshold |
|-------|-----------------|----------------|
| `security-scan` | **HIGH severity finding** (OWASP A01–A10 applicable) | MEDIUM or LOW — user reviews, may acknowledge |
| `env-check` | **Required envvar missing** (per `secure/manifest.yaml`) | Drift in optional env / config |
| `dep-health-check` | **HIGH-severity CVE in runtime path** | Outdated deps without CVE, transitive warnings |
| `db-migration-check` | **Migration has no safe rollback** (destructive without reversal path) | Migration is slow but safe |
| `readiness-check` (aggregator) | **Any block-level finding** above | Any warn-level finding — user sign-off required |

The gate is a single pass/fail emitted as the readiness report. Blocks halt deploy; warnings prompt an explicit user "yes, ship anyway" before deploy runs.

## Recommended flow

```
readiness-check (runs all 4 ops checks + severity aggregation)
  │
  ├─ block-level findings present?   → HALT; fix + re-run
  │
  ├─ warn-level findings present?   → surface to user for explicit sign-off
  │
  └─ all clear                       → deploy
                                       │
                                       ├─ smoke-test (post-deploy)
                                       │
                                       ├─ smoke passes                → Phase 7 complete, next_phase: 8-operate
                                       │
                                       └─ smoke fails                 → rollback, back to Phase 6
```

## Rollback + smoke-test scoping

Plan §4.3 asked for a rollback + smoke-test scoping decision for v1.

**Decision:** neither ships as a separate sub-skill in Phase 7 for v1. Rationale:

- **Rollback** — highly platform-specific (`kubectl rollout undo`, `vercel rollback`, `git revert + redeploy`, manual DB restore). A generic skill degrades to "tell the user to roll back" which adds no value. `deploy`'s on-failure branch already surfaces the rollback need; the concrete command lives in the project's own runbook.
- **smoke-test** — tightly coupled to the deployed surface. For web apps: `@qa` invokes `webapp-testing` (Anthropic skill, wrapped in Wave 2 §2.11). For APIs: `test-automation` runs the integration-test subset tagged `@smoke`. For CLI tools: the existing test suite is the smoke. No new skill adds capability here; it would be ceremony.

Both ship as **embedded steps inside `deploy`'s workflow** rather than separate skills. If a future project has a recurring rollback pattern worth factoring out, the two skills can be carved out then.

## Exit conditions

Phase 7 is complete when all of:

1. `deploy` succeeded to the target environment.
2. Post-deploy smoke test passed (embedded in `deploy` workflow).
3. Readiness report + security scan archived to `_context/audit/`.

If smoke fails, deploy's on-failure branch routes to rollback; the phase returns to Phase 6 for the fix cycle.

## Creative skills typically useful in this phase

Rare. Deployment is execution work. But if a rollout plan needs narrative framing (e.g., customer-facing announcements), `@communicator` can invoke:

- [`presentation`](../../skills/creative/presentation/) — for release notes with presentation treatment.
- [`storytelling`](../../skills/creative/storytelling/) — for customer-communication narratives.

Not Phase-7-owned.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-23 | Cadbury-hq | Flesh-out per Wave 4 §4.3. Added entry + exit conditions, severity-weighted readiness-gate table (block-level vs warn-level per check), corrected `next_phase` to `8-operate` (per Phase 8 split in Wave 4 §4.11), rollback + smoke-test scoping decision (embedded in `deploy` rather than separate skills, with rationale), creative-skills cross-cutting note per §4.10. |
| 1.1 | 2026-04-23 | Cadbury-hq | `next_phase: 8-evolve` → `next_phase: 8-operate` (Phase 8 split). |
| 1.0 | 2026-04-13 | Alfred | Initial Phase 7 definition. |
