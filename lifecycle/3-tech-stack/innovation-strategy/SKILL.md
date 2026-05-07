---
name: "innovation-strategy"
description: "Phase 3 router — routes to the canonical innovation-strategy skill with Phase 3 context bias (technology adoption lifecycle, platform ecosystem, make-vs-buy)"
type: "router"
category: "lifecycle"
phase: 3
agent: "architect"
routes_to: "skills/creative/innovation-strategy/"
version: "1.0"
---

## Purpose

Thin router that invokes `skills/creative/innovation-strategy/` with Phase 3 context. The router bias for Phase 3 (technology adoption lifecycle, platform ecosystem design, unbundling, make-vs-buy) is loaded from `data/methods/method-defaults.yaml phase_3.innovation_strategy`.

## When to Use

- "should we build or buy this component?"
- "where is this technology in its adoption lifecycle?"
- "evaluate platform ecosystem lock-in"
- During stack-discovery-sync classification or stack-evaluation lock-in dimension

## Routes to

→ [skills/creative/innovation-strategy/](../../../skills/creative/innovation-strategy/)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Phase 3 creative router stub — extends innovation-strategy phases from [2, 8] to [2, 3, 8] |
