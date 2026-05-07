---
name: "orient"
description: "Butler's first-session check-in — scaffold health report, lifecycle introduction, and routing to intake"
type: "workflow"
category: "lifecycle"
phase: 1
agent: "butler"
status: "available"
inputs:
  - ".coldpress/local-config.yaml (read-only, for resume state + graph-rebuild retry)"
  - "coldpress.yaml (read-only, for sanity check)"
outputs:
  - artifact: "Scaffold health report"
    location: "_context/tracking/orient-{date}.md"
    format: "markdown"
next_skill: "intake"
version: "1.0"
---

## Purpose

Run once per Butler session at the start of Phase 1. Three jobs:

1. **Mode detection** — is this a first session, a re-entry, or a resume of a partially completed intake step?
2. **Scaffold sanity** — does the project layout look healthy (CLI-generated files present, yaml valid)?
3. **Lifecycle introduction** — on a first session, orient the user to the 9-phase flow before intake runs.

Orient is *cheap and fast*. It reads files, runs pure validators, and prompts before Butler starts producing output artefacts. The heavy work — material solicitation, intent seed, graph prime — lives in the next skill, `intake`.

## When to Use

- **Automatic**: at the start of every Butler session where Phase 1 is not yet complete (`.coldpress/local-config.yaml phase_1_completed != true`).
- **Manual**: the user says "check the scaffold" or "status" in a session that was never finished.

## Prerequisites

- `coldpress init` has run (scaffolded `coldpress.yaml`, `.claude/agents/`, `CLAUDE.md`).
- Butler's SYSTEM.md has loaded (this skill is invoked by Butler on session start).

## Process

Multi-step guided workflow — see [workflow.md](workflow.md).

## Output

A short scaffold health report at `_context/tracking/orient-{date}.md` summarising:

- Mode detected (first-session / re-entry / resume)
- Sanity check results (yaml valid, template files present, `coldpress doctor` core checks)
- Graph-rebuild retry result (if `needs_graph_rebuild` was set)
- Handoff to `intake`

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial orient skill for the npm-era Phase 1 (Wave 3.1 of Phase II Part 1). Replaces the submodule-era `machine-setup` + `project-init` + `agent-scaffold` trio (those are retired in Wave 4). |
