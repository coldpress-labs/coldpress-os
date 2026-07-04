---
name: outcome-contract
description: "Author the outcome contract (P4) — _context/planning/outcomes.yaml: every P0/P1 PRD requirement linked to a measurable target + the source that measures it. This is the framework's definition of success being the PRODUCT's, not the process's. Block-gate at P4 (`coldpress outcomes check`): a P0/P1 requirement with no measurable outcome fails the gate. Downstream: P6 analytics-plan designs the events, P9 readiness asserts instrumentation, P10 ops-check reports actual-vs-target, P11 retrospective grades against it."
license: MIT
compatibility: Invoked by @pm in Phase 4
version: "1.0"
---

## Purpose

The plan's biggest v1 gap was that the framework verified *builds* but never measured *outcomes*. The outcome contract closes it: for every priority requirement, a number that says "this is what working looks like" and a source that can measure it. Authored at P4 (right after the PRD), it becomes the through-line the rest of the lifecycle honours — P6 designs the analytics events that emit it, P9 asserts they're wired, P10 reports actual-vs-target, P11 grades against it.

## When to Use

- Immediately after `create-prd`, before the P4 exit gate. The gate (`outcomes-contract-present`, block-severity) will not pass without it.
- Re-run after a PRD amendment that adds/repriorities a P0/P1 requirement.

## Prerequisites

- `_context/sacred/prd.md` exists with numbered requirements carrying a **priority** (P0/P1/P2/P3). The outcome contract keys back to those requirement ids.

## Process

1. **Harvest the priority requirements.** From the PRD, list every **P0** and **P1** requirement by id. These are the requirements the contract MUST cover — a P0/P1 with no outcome fails the gate. P2/P3 outcomes are optional (author them when a metric is cheap and meaningful).

2. **For each, pick the one metric that proves it works.** Prefer a product/user outcome over a proxy — activation rate, task-completion, conversion, retention, latency (p95), SEO position, cost-per-run, uptime. Not "we shipped feature X" (that's output, not outcome). Pull candidate metrics from the product-brief's north-star + the idea-validation leading indicators so the contract inherits the discovery work rather than inventing fresh numbers.

3. **Set an honest target.** A concrete threshold: `">= 40%"`, `1800` (ms) with `unit: "ms"`, `"top 3"`, `"< $0.05"`. Under-promise; a target you can't measure or won't hit is worse than none.

4. **Name the measurement source** — how this number is actually read at P10:
   - `analytics_event` — an event the product emits (P6 `analytics-plan` will design it; `ref` is the event name).
   - `uptime_probe` / `search_console` / `revenue_report` / `cost_report` / `manual`.
   The `ref` is the concrete handle (event name, probe id, report). A metric with no real source is a wish, not a contract.

5. **Emit `_context/planning/outcomes.yaml`** validated against `schemas/planning-artefacts/outcomes.schema.ts`:

   ```yaml
   outcomes:
     - requirement_id: "R-001"
       priority: "P0"
       metric: "activation_rate"
       target: ">= 40%"
       source: { type: "analytics_event", ref: "onboarding_completed" }
     - requirement_id: "R-004"
       priority: "P1"
       metric: "latency_p95"
       target: 1800
       unit: "ms"
       source: { type: "uptime_probe", ref: "api-health" }
   ```

6. **Verify** with `coldpress outcomes check` (the same command the P4 gate runs): valid schema + every P0/P1 requirement covered. Green → the P4 gate's `outcomes-contract-present` check passes.

## Output

`_context/planning/outcomes.yaml` — the measurable definition of done for this product. Feeds P6 `analytics-plan` (events that implement the sources), P9 `readiness` (instrumentation assertion), P10 `ops-check` (actual-vs-target digest), P11 `retrospective` (graded against it).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-04 | Butler (v0.4 WS10-A1) | NEW. The missing P4 producer for `outcomes.yaml` (system-integration audit A1: consumed by the P4 block-gate + P6/P9/P10/P11 + `coldpress outcomes`/`trace`, produced by nothing — the gate's remediation named a skill that did not exist). Authors the outcome contract from the PRD's P0/P1 requirements + the product-brief/idea-validation metrics; each requirement → measurable target + measurement source, validated by `coldpress outcomes check`. |
