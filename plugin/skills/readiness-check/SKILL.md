---
name: readiness-check
description: Phase 9 entry skill (per Q1) + meta-aggregator. Step 0 absorbs entry-sync. Aggregates env-check + dep-health-check + security-scan + db-migration-check (conditional) into readiness-report distillate. Used both pre-deploy (full aggregation) and post-deploy (smoke + observability).
license: MIT
compatibility: Invoked by @devops in Phase 9
version: "2.0"
---

## Purpose

Phase 9 entry skill + meta-aggregator. Step 0 absorbs entry-sync work (graph-first context + 8th-consumer staleness check). Subsequent steps:

**Pre-deploy aggregation (Phase 9 entry):**
- Dispatch env-check
- Dispatch dep-health-check
- Dispatch security-scan
- Dispatch db-migration-check (conditional brownfield)
- Aggregate results into readiness-report
- Pre-deploy gate evaluation (5 checks; block if any fail)

**Post-deploy verification (Phase 9 exit):**
- Smoke tests
- Observability baseline check
- Post-deploy gate evaluation (3 checks; block if any fail)

## When to Use

- Phase 9 entry — invoked automatically as the first Phase 9 skill.
- Phase 9 exit — re-invoked for post-deploy verification.

## Prerequisites

- Phase 8 gate passed
- wave-status final
- implementation-readiness Phase 7 report status: pass
- phase-8-to-9 handoff written

## Process

Multi-step workflow.

→ See [workflow.md](workflow.md).

## Output

`_context/audit/readiness-v{N}.md` — meta-aggregator validated-distillate. Pre-deploy variant aggregates 5 checks; post-deploy variant aggregates 3 checks.

## Cross-cutting wire-ins

- `adversarial-review` — pre-deploy plan red-team
- `editorial` — readiness-report structure

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #15 Wave 9.2) | Phase 9 rewrite. Now serves as Phase 9 entry skill per Q1 — Step 0 absorbs entry-sync (graph-first 9 graph_queries; 8th-consumer staleness helper). Inputs converted to graph-first; expanded to include wave-status, code-review reports, implementation-readiness Phase 7 report. Outputs: readiness-v{N}.md validated-distillate (meta-aggregator). Pre-deploy (5 checks) + post-deploy (3 checks) variants per Q2. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial readiness-check skill |
