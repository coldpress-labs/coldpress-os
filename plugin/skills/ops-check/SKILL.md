---
name: ops-check
description: Phase 10 — the scheduled operations digest that answers 'is the product achieving what we built it for', not just 'is it up'. Pulls the deploy-pack connectors (analytics, uptime, error stream, cert/domain expiry, backup recency, CVE re-scan of the shipped lockfile) and reports ACTUAL-VS-TARGET against outcomes.yaml. Runs headless on a schedule (n8n/cron → Agent SDK → digest).
license: MIT
compatibility: Invoked by @devops in Phase 10
allowed-tools: "Read Write Bash"
---

## Purpose

Steady-state awareness from **real signals**, closing the outcome-contract thread.
The framework verified the build exhaustively; `ops-check` measures whether the
*product* is working — for each `outcomes.yaml` metric, the **actual** (from its
declared measurement source) against the **target**. Mostly **scheduled**, not
session-driven: a weekly cron on the Mac Mini invokes the Agent SDK, which runs
this and writes the digest to the NAS.

## When to Use

- On a schedule (weekly/monthly per project) — the primary mode.
- Ad hoc after a release or an incident, to check the numbers moved the right way.

## Process

1. **Read the outcome contract** — `_context/planning/outcomes.yaml`: each priority
   requirement's measurable target + its measurement source (analytics event,
   uptime probe, search console, revenue report…).
2. **Pull the connectors** from the deploy pack + project config:
   - **Analytics** — the outcome events firing at their destination (activation,
     conversion, task-completion…).
   - **Uptime / error stream** — availability + error rate (proportionate: cron
     hitting endpoints, Sentry where present).
   - **Cert / domain expiry** — the thing that silently expires.
   - **Backup recency** — last successful backup within policy (T1+).
   - **CVE re-scan** — re-scan the *shipped* lockfile against current advisories
     (a dependency safe at ship can become vulnerable — CVE high+ **auto-creates an
     incident** via `incident-response`).
3. **Compute actual-vs-target** — per outcome metric: actual, target, delta, trend
   vs the last digest. Flag misses.
4. **Write the one-page digest** — `_context/operations/ops-digests/ops-{date}.md`:
   outcomes table (actual/target/trend), uptime/errors, expiries, backup status,
   CVE findings. Feeds `client-health-report` (P10) + the P11 `retrospective`.

## Output

`ops-{date}.md` — the actual-vs-target digest. Outcome misses and CVE findings
route to `correct-course` / `incident-response`; the trend feeds P11.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS8) | NEW (§5 P10 / outcome-contract thread). Scheduled ops digest: deploy-pack connectors (analytics/uptime/error/cert/backup/CVE-rescan) → **actual-vs-target against outcomes.yaml**. CVE high+ auto-creates an incident. Runs headless (cron → Agent SDK → digest to NAS). Feeds client-health-report + the P11 retrospective. |
