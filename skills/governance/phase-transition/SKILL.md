---
name: "phase-transition"
description: "Run the exit gate for the current phase, rebuild the graph, and write the handoff artefact — the canonical inter-phase handshake"
type: "workflow"
category: "governance"
agent: "qa"
status: "wire-in-every-phase-transition"
phases: [1, 2, 3, 4, 5, 6, 7, 8, 9]
inputs:
  - "from_phase: integer (1-9)"
  - "to_phase: integer (2-9)"
  - "`lifecycle/<from-phase>/gate.json`"
  - "`.coldpress/local-config.yaml`"
  - "`.coldpress/graph/graph.json`"
outputs:
  - artifact: "Handoff Log"
    location: "_context/handoffs/phase-{from}-to-phase-{to}-{date}.md"
    format: "markdown"
  - artifact: "Gate Evaluation"
    location: "_context/audit/gate-eval-phase-{from}-{date}.json"
    format: "json"
version: "1.0"
---

## Purpose

The canonical inter-phase handshake. Every phase transition — regardless of which phase is starting — runs through this skill before the next phase's first skill fires. It ensures:

1. **Exit gate passes** — all block-severity checks in the outgoing phase's `gate.json` are green.
2. **Graph is current** — knowledge graph is rebuilt so the incoming phase starts with fresh node data.
3. **Handoff is logged** — a durable handoff artefact records what was completed, what was deferred, and any open questions for the incoming phase.

Without this skill, phase transitions were implicit prose handoffs. With it, they are contract-backed and auditable.

## When to Use

- At the end of any phase before starting the next
- When Butler transitions from intake (Phase 1) to pre-project-interview (Phase 2)
- When Phase 2 Discovery is complete and Phase 3 Tech-Stack begins
- For all subsequent phase boundaries

## Prerequisites

- Current phase's core artefacts are present (`_context/sacred/context.md` for Phase 1→2, etc.)
- `.coldpress/local-config.yaml` accessible for phase-completion markers

## Process

This skill follows a 3-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

Handoff log at `_context/handoffs/phase-{from}-to-phase-{to}-{date}.md` + gate evaluation JSON.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial phase-transition skill per Phase II Part 2 Wave 4.5. Wraps gate-check + graph-rebuild + handoff-log into a single governance entry point. Cross-Part impact: upgrades intake Step 6 to invoke this skill. |
