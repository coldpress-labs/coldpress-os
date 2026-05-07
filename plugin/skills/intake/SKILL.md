---
name: intake
description: Phase 1 intake — collect material, determine project shape, seed intent, capture working mode, prime the graph
license: MIT
compatibility: Invoked by @butler in Phase 1
version: "1.0"
---

## Purpose

The real work of Phase 1. Butler runs this after `orient` confirms the scaffold is healthy. Six steps, one output each; the user can stop after any of them and resume later.

1. **Material solicitation** — walk the 5 `_input/` subfolders with the user.
2. **Shape determination** — greenfield / brownfield / ambiguous, derived from whether `_input/legacy/` has content.
3. **Intent seed** — one-sentence project intent, written as a frontmatter + `status: seed` shell into `_context/sacred/context.md`.
4. **Working mode** — four quick questions (IDE preference, cadence, team shape, `butler.display_name`) written back to `coldpress.yaml`.
5. **Graph prime** — trigger `coldpress graph rebuild`; warn-not-block on failure (records `needs_graph_rebuild` for orient retry next session).
6. **Gate and route** — exit checklist; on pass, hand off to Phase 2 `pre-project-interview`.

## When to Use

- **Automatic**: invoked by Butler right after `orient` completes, if Phase 1 is not yet done.
- **Re-run**: the user can re-invoke `intake` Step 1 (material solicitation) later to ingest new material — without re-running Steps 2-6. Re-entry appends to the intake report; it does not corrupt the phase state.

## Prerequisites

- `orient` has run in this session (or the user explicitly invoked intake from a later phase with new material).
- `coldpress.yaml` passes the runtime-phase validator.

## Process

Multi-step guided workflow — see [workflow.md](workflow.md) for the step index and re-entry rules.

## Output

Three output streams:

- **Tracking report** at `_context/tracking/intake-{date}.md` — append-only; one section per step.
- **Sacred-doc seed** at `_context/sacred/context.md` — frontmatter + one-line intent + placeholder sections for Phase 2 `pre-project-interview` to expand.
- **yaml write-back** to `coldpress.yaml` — `user.preferred_ides`, `user.cadence`, `user.team_shape`, `butler.display_name` (if renamed).
- **Local state** — `.coldpress/local-config.yaml` fields: `project_shape`, `phase_1_completed`, `phase_1_completed_at`, `partial_completion` markers per step.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial intake skill for the npm-era Phase 1 (Wave 3.2 of Phase II Part 1). Formalises the conversation flow from [phase-1-deep-dive-2026-04-23.md](../../../docs/lifcyle-phases-deep-dives/phase-1-deep-dive-2026-04-23.md). |
