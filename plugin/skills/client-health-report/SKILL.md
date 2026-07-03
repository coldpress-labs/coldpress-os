---
name: client-health-report
description: "Phase 10 (client projects) — a monthly one-pager distilled from the ops-check digests: outcome trends (actual-vs-target over time), uptime, incidents + resolutions, upcoming renewals, and recommended next work. Makes maintenance visible, billable, and strategic — the client sees RESULTS, not just uptime."
license: MIT
compatibility: Invoked by @devops in Phase 10
allowed-tools: "Read Write"
---

## Purpose

Turn operations into a client-facing story of **results**. Uptime alone is table
stakes; this report shows whether the product is achieving its **outcomes** and
what to do next — so ongoing maintenance is visible, billable, and strategic
rather than invisible until something breaks.

## When to Use

- Monthly, per client project — after the month's `ops-check` digests exist.

## Process

1. **Aggregate the month's ops digests** — pull each `ops-{date}.md`.
2. **Outcome trends** — for each `outcomes.yaml` metric, plot actual-vs-target
   across the month (the headline: are the numbers we agreed to move, moving?).
3. **Reliability** — uptime, error rate, incidents + how they were resolved (from
   `incident-response` records) — honestly, including misses.
4. **Housekeeping** — upcoming cert/domain renewals, backup status, CVE posture.
5. **Recommended next work** — the studio's read: what to invest in next
   (outcome gaps → product-evolution backlog; risks → hardening). This is where
   maintenance becomes strategic (and the next engagement).
6. **Write the one-pager** — `_context/operations/health-reports/health-{month}.md`,
   client-readable, no internal jargon.

## Output

`health-{month}.md` — a monthly client health report. Outcome gaps feed the P11
`product-evolution` backlog; the report is delivered via the client channel.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS8) | NEW (§5 P10). Monthly client one-pager from the ops-check digests: outcome trends (actual-vs-target), reliability + incidents, renewals/backup/CVE, recommended next work. Results-first (not uptime-only); feeds product-evolution + the client relationship. |
