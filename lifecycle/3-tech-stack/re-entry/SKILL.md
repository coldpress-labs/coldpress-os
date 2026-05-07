---
name: "re-entry"
description: "Phase 3 re-entry router. Invoked when phase_3_completed: true and the user wants to amend baselines, revise a specific ADR, or re-provision the environment. Never re-runs the full Phase 3 flow."
type: "router"
category: "lifecycle"
phase: 3
agent: "architect"
inputs:
  - "coldpress.yaml"
  - "_context/sacred/tech-stack.md"
outputs:
  - artifact: "Target skill invoked"
    location: "varies by path chosen"
    format: "varies"
version: "1.0"
---

## Purpose

After Phase 3 is complete (`phase_3_completed: true`), users sometimes need targeted revisions: tweaking baselines, updating a single ADR, or re-running env-provision. This router surfaces the 3 valid post-lock paths and dispatches to the correct skill — without forcing a full Phase 3 re-run.

## When to Use

- Phase 3 is already complete and the user wants to change something
- Invoked automatically by `stack-discovery-sync` Step 0 when `phase_3_completed == true`
- User explicitly asks to: "change my baselines", "revise a stack decision", "re-run env setup"

## Prerequisites

- `phase_3_completed: true` in `coldpress.yaml`
- `_context/sacred/tech-stack.md` is sacred-locked

## Process

→ See [workflow.md](workflow.md) for the full process.

## Output

Target skill invoked for the user's chosen path.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial re-entry router for Phase 3 post-lock revision paths |
