---
name: "analytics-plan"
description: "Phase 6. The event schema implementing the outcome contract — events, properties, trigger points, destination — so instrumentation is DESIGNED, not sprinkled. Events attach to stories at P7; P9 smoke asserts they fire."
type: "simple"
category: "lifecycle"
agent: "architect"
phases: [6]
tools: ["Read", "Write"]
inputs:
  - "_context/planning/outcomes.yaml (the outcome contract)"
outputs:
  - artifact: "analytics-plan"
    location: "_context/architecture/analytics-plan.yaml"
    format: "yaml"
    schema: "schemas/architecture/p6-artifacts.schema.ts (AnalyticsPlan)"
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
