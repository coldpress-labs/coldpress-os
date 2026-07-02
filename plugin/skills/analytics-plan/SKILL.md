---
name: analytics-plan
description: Phase 6. The event schema implementing the outcome contract — events, properties, trigger points, destination — so instrumentation is DESIGNED, not sprinkled. Events attach to stories at P7; P9 smoke asserts they fire.
license: MIT
compatibility: Invoked by @architect in Phase 6
version: "1.0"
---

## Purpose

The outcome contract (P4 `outcomes.yaml`) declares *what success is measured by*;
this skill designs the **events that implement it**. Instrumentation becomes a
designed artifact, not something sprinkled during Build.

## Process

1. For each outcome in `outcomes.yaml`, define the event(s) that measure it: `name`,
   `properties`, `trigger` point, `destination`, and `outcome_ref` back to the
   requirement/metric.
2. Every P0/P1 outcome must have an implementing event (P6 completeness check).

## Output

`_context/architecture/analytics-plan.yaml` — validates against `AnalyticsPlan`.
Events attach to their stories' acceptance criteria at P7; the P9 smoke asserts
they arrive at their destination; P10 reports actual-vs-target.
