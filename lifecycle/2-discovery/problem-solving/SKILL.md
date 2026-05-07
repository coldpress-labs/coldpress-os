---
name: "problem-solving"
description: "Apply systematic problem-solving frameworks during discovery — root cause analysis, structured decomposition, solution exploration"
type: "router"
category: "lifecycle"
phase: 2
routes_to: "skills/creative/problem-solving/"
agent: "analyst"
version: "1.0"
---

## Router

This is a lifecycle router. It makes the `problem-solving` skill available during Phase 2 (Discovery).

→ Read and follow `../../../skills/creative/problem-solving/SKILL.md`

## Phase 2 Context

During discovery, problem-solving is used to:
- Drill root causes when the stated problem feels like a symptom, not the core
- Frame complex ambiguous challenges before `pre-project-interview` writes `context.md`
- Decompose messy problem spaces into structured sub-problems Phase 3 and Phase 4 can act on
- Pressure-test the riskiest assumptions surfaced by `validate-idea` (when it lands in Wave 2.4)

The canonical skill ships 30 frameworks spanning diagnosis, analysis, evaluation, creative, and synthesis categories. Several of these methods are already Tier 1 wire-ins for specific Phase 2 sub-skills (Problem Statement Refinement + Five Whys for `validate-idea` Step 1; see `method-defaults.yaml` Wave 3.10) — this router surfaces the broader catalog for on-demand invocation.

## Invocation

Examples of when Butler would invoke this router during Phase 2:
- *"I need help solving this problem"* — explicit invocation
- *"Why does this keep happening?"* — triggers root-cause drill (Five Whys)
- During `pre-project-interview` Step 3 when constraints feel like surface-level symptoms
