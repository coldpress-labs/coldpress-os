---
name: env-provision
description: Provision the development environment from the locked tech stack. Dispatches to stack-pack quickstart if a pack was confirmed; falls back to generic Node/Python/other-runtime install path when stack_pack is empty.
license: MIT
compatibility: Invoked by @developer in Phase 3
version: "2.0"
---

## Purpose

Sets up the complete development environment based on the locked tech stack. Dispatches to the stack pack's quickstart skill if a pack was confirmed at Phase 3 stack-locking; otherwise runs the generic provision path. Installs dependencies, configures core tooling, activates confirmed baselines, and verifies everything works together.

After this skill runs: you can start coding immediately, baselines are wired up, and a tracking doc records what was activated.

## When to Use

- "set up the dev environment"
- "install dependencies"
- "configure the project"
- "get the project ready to code"
- After `stack-locking` completes and `phase_3_completed: true` is set in `coldpress.yaml`

## Prerequisites

- `_context/sacred/tech-stack.md` exists and is sacred-locked
- `coldpress.yaml` has `phase_3_completed: true` and `stack_pack` field set (non-empty = pack confirmed; `""` = no pack)
- `coldpress.yaml baselines:` block present with per-category `status` values
- Project directory initialized (Phase 1 bootstrap complete)
- Node.js / relevant runtime installed on the machine

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A fully configured development environment: dependencies installed, tooling configured, activated baselines wired up, tracking doc written, and core checks passing.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-24 | Cadbury-hq | Round 2 rewrite: added stack_pack dispatch (step-00-branch); Part B baselines activation loop in step-03-configure; baseline checks in step-04-verify; tracking doc output. |
| 1.0 | 2026-04-08 | Alfred | Initial env-provision skill for Phase 3 |
