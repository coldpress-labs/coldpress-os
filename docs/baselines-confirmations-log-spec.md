---
title: "Baselines Confirmations Log — Format Spec"
version: "1.0"
date: "2026-04-24"
author: "Cadbury-hq"
---

# Baselines Confirmations Log — Format Spec

> Sibling to `supersessions-log-spec.md` and `stack-lock-decisions-log-spec.md`.

## Location

```
_context/audit/baselines-confirmations-{date}.md
```

One file per Phase 3 run. `{date}` = ISO date of the env-provision baselines confirmation session (e.g. `2026-04-24`).

## Purpose

Records each user decision on the four cross-cutting baseline categories during stack-locking Step 5b (baselines confirmation) and env-provision Part B. Provides audit-trail evidence for the `baselines-confirmations-logged` gate check.

## Format

Append-only. One row per category decision. Four rows in a standard run (one per baseline); additional rows if any category is revised.

```markdown
| Date | Approver | Baseline category | Status | Covered by pack | Overrides | Rationale |
|---|---|---|---|---|---|---|
| 2026-04-24T10:22:00Z | user | seo_aeo_llm | confirmed | true | — | — |
```

## Column definitions

| Column | Type | Notes |
|--------|------|-------|
| Date | ISO 8601 datetime | Timestamp of the decision. |
| Approver | string | `user` or named stakeholder. |
| Baseline category | enum | `seo_aeo_llm`, `accessibility`, `security`, `future_proof`. |
| Status | enum | `confirmed`, `opted-out`, `confirmed-with-override`. |
| Covered by pack | enum | `true`, `false`, `partial`. |
| Overrides | string | JSON-like key-value pairs if `confirmed-with-override`; `—` otherwise. |
| Rationale | string | Required for `opted-out`; optional for `confirmed-with-override`; `—` for `confirmed`. |

## Example — standard run, all confirmed

```markdown
| Date | Approver | Baseline category | Status | Covered by pack | Overrides | Rationale |
|---|---|---|---|---|---|---|
| 2026-04-24T10:22:00Z | user | seo_aeo_llm | confirmed | true | — | — |
| 2026-04-24T10:22:30Z | user | accessibility | confirmed | partial | — | Pack gives semantic HTML; env-provision adds axe-core + eslint-jsx-a11y |
| 2026-04-24T10:23:00Z | user | security | confirmed | partial | — | — |
| 2026-04-24T10:23:30Z | user | future_proof | confirmed-with-override | false | { cwv_lcp_threshold: "2.0s" } | Client is performance-obsessed |
```

## Example — one category opted out

```markdown
| Date | Approver | Baseline category | Status | Covered by pack | Overrides | Rationale |
|---|---|---|---|---|---|---|
| 2026-04-24T10:22:00Z | user | seo_aeo_llm | opted-out | false | — | Internal tool — SEO/AEO has no value for this use case |
| 2026-04-24T10:22:30Z | user | accessibility | confirmed | false | — | — |
| 2026-04-24T10:23:00Z | user | security | confirmed | partial | — | — |
| 2026-04-24T10:23:30Z | user | future_proof | confirmed | false | — | — |
```

## Gate check

`baselines-confirmations-logged` in `lifecycle/3-tech-stack/gate.json` — **warn** severity. Checks that `_context/audit/baselines-confirmations-*.md` has entries with date after `phase_3_started_at` from local-config.

---


---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 11 Shape A subagents (analyst · architect · pm · ux-designer · scrum-master · developer · qa · devops · reviewer · communicator · valet) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.
### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | ColdPress Labs | Initial spec — Part 3 Wave 4 §4.12 |
