---
name: "brainstorming"
description: "Phase 3 router — routes to the canonical brainstorming skill with Phase 3 context bias (stack candidates, evaluation, pre-lock)"
type: "router"
category: "lifecycle"
phase: 3
agent: "architect"
routes_to: "skills/creative/brainstorming/"
version: "1.0"
---

## Purpose

Thin router that invokes `skills/creative/brainstorming/` with Phase 3 context. The router bias for Phase 3 (stack candidates, evaluation decisions, pre-lock alternatives) is loaded from `data/methods/method-defaults.yaml phase_3.brainstorming`.

## When to Use

- "brainstorm alternatives for this decision area"
- "generate more stack candidates"
- "challenge our evaluation"
- During stack-discovery-sync, stack-evaluation, or stack-locking pre-lock review

## Routes to

→ [skills/creative/brainstorming/](../../../skills/creative/brainstorming/)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Phase 3 creative router stub — extends brainstorming phases from [2] to [2, 3] |
