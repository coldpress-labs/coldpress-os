---
name: phase-transition
description: Run the exit gate for the current phase, rebuild the graph, and write the handoff artefact — the canonical inter-phase handshake
license: MIT
compatibility: Invoked by @butler in Phase 1
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
