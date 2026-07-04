---
title: "Stack-lock Decisions Log — Format Spec"
version: "1.0"
date: "2026-04-24"
author: "Cadbury-hq"
---

# Stack-lock Decisions Log — Format Spec

> Sibling to `supersessions-log-spec.md` and `baselines-confirmations-log-spec.md`.

## Location

```
_context/audit/stack-lock-decisions-{date}.md
```

One file per stack-locking run. `{date}` = ISO date of the run (e.g. `2026-04-24`).

## Purpose

Records the Phase 3 stack-lock decision: what red-flag signals were raised (if any), what disposition the user chose, and which artefacts the lock covers. Provides audit-trail evidence for the `stack-lock-decisions-log-exists` gate check.

## Format

Append-only. One row per lock decision (most projects have one; re-runs following a governance ADR revision add a new row).

```markdown
| Date | Approver | Flags | Disposition | Rationale | Linked artefact |
|---|---|---|---|---|---|
| 2026-04-24T10:15:00Z | user | none | proceed | Clean lock — no red flags | tech-stack.md + stack-selection-summary-v1.md |
```

## Column definitions

| Column | Type | Notes |
|--------|------|-------|
| Date | ISO 8601 datetime | Timestamp when user confirmed the lock. |
| Approver | string | `user` or named stakeholder if `team_shape = team`. |
| Flags | string | Pipe-delimited list of red-flag signal codes raised at step-03a (e.g. `lock-in-cluster:3x9`, `team-familiarity-cliff:3decisions`, `supersede-pending:brief-stack-assumption`). `none` if no flags. |
| Disposition | enum | `proceed`, `revise-adrs`, `pause`, `halt`. |
| Rationale | string | User-provided explanation. Required when Disposition ≠ `proceed`. |
| Linked artefact | string | Comma-separated paths to the artefacts this decision locked. |

## Example — clean lock

```markdown
| Date | Approver | Flags | Disposition | Rationale | Linked artefact |
|---|---|---|---|---|---|
| 2026-04-24T10:15:00Z | user | none | proceed | Clean lock — no red flags | tech-stack.md + stack-selection-summary-v1.md |
```

## Example — lock with red flags accepted

```markdown
| Date | Approver | Flags | Disposition | Rationale | Linked artefact |
|---|---|---|---|---|---|
| 2026-04-24T10:15:00Z | user | lock-in-cluster:3x9, team-familiarity-cliff:3decisions, supersede-pending:brief-stack-assumption | proceed | Aware of risks; time-to-market priority outweighs lock-in concern for this client engagement | tech-stack.md + stack-selection-summary-v1.md |
```

## Example — revision after ADR governance change

```markdown
| Date | Approver | Flags | Disposition | Rationale | Linked artefact |
|---|---|---|---|---|---|
| 2026-04-24T10:15:00Z | user | none | proceed | Clean lock | tech-stack.md + stack-selection-summary-v1.md |
| 2026-04-25T14:30:00Z | user | none | revise-adrs | Client changed hosting constraint — renegotiating database decision | adr-database-v2.md |
```

## Gate check

`stack-lock-decisions-log-exists` in `lifecycle/3-tech-stack/gate.json` — **warn** severity. Checks that at least one entry exists with date after `phase_3_started_at` from local-config.

---


---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.
### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | ColdPress Labs | Initial spec — Part 3 Wave 4 §4.5 |
