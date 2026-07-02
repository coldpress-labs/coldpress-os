---
name: intake
description: Phase 1 — Bootstrap's single entry skill. Check in, collect material, determine project shape, and author the project's full context.md
license: MIT
compatibility: Invoked by @butler in Phase 1
version: "2.0"
---

## Purpose

The whole of Phase 1. Thirteen steps, one output each; the user can stop after any of them and resume later.

1. **Mode detect** — first-session / re-entry / resume.
2. **Greeting** — first-session only.
3. **Sanity check** — scaffold health (`coldpress doctor`, yaml validity, template probes, pre-commit hook).
4. **Lifecycle intro** — 30-second phase preview, skippable.
5. **Material solicitation** — walk the 5 `_input/` subfolders with the user.
6. **Shape determination** — greenfield / brownfield / ambiguous, derived from whether `_input/legacy/` has content.
7. **Intent seed** — one-sentence project intent, written as a frontmatter + `status: seed` shell into `_context/sacred/context.md`.
8. **Vision** — enrich the seed into problem, scope, and success criteria.
9. **Users** — user types, value proposition, brownfield prior-user notes.
10. **Constraints** — technical + non-technical (budget/timeline/team/compliance/org) + brownfield carry-over + business rules + non-obvious gotchas.
11. **Synthesize** — merge Steps 8-10 into context.md, promote `status: seed` → `authored`, schema-validate, capture sacred signoff.
12. **Working mode** — four quick questions (IDE preference, cadence, team shape, `butler.display_name`) written back to `coldpress.yaml`.
13. **Gate and route** — exit checklist; on pass, hand off to Phase 2's `research`.

## When to Use

- **Automatic**: at the start of every Butler session where Phase 1 is not yet complete (`.coldpress/local-config.yaml phase_1_completed != true`), or the very first thing Butler runs on a fresh project.
- **Manual**: the user says "check the scaffold," "status," "start discovery," or "let's begin" in a session that was never finished.
- **Re-run**: the user can re-invoke `intake` at Step 5 (material solicitation) later to ingest new material — without re-running Steps 6-13. Re-entry appends to the intake report; it does not corrupt the phase state.

## Prerequisites

- `coldpress init` has run (scaffolded `coldpress.yaml`, `.claude/agents/`, `CLAUDE.md`).
- Butler's SYSTEM.md has loaded (this skill is invoked by Butler on session start).

## Process

Multi-step guided workflow — see [workflow.md](workflow.md) for the step index and re-entry rules.

## Output

Three output streams:

- **Tracking report** at `_context/tracking/intake-{date}.md` — append-only; one section per step.
- **Sacred document** at `_context/sacred/context.md` — seeded at Step 7, fully authored and sacred-signed-off by Step 11.
- **yaml write-back** to `coldpress.yaml` — `user.preferred_ides`, `user.cadence`, `user.team_shape`, `butler.display_name` (if renamed).
- **Local state** — `.coldpress/local-config.yaml` fields: `project_shape`, `phase_1_completed`, `phase_1_completed_at`, `partial_completion` markers per step.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial intake skill for the npm-era Phase 1 (Wave 3.2 of Phase II Part 1). |
| 2.0 | 2026-07-02 | Butler | Absorbed `orient` (Steps 1-4) and `pre-project-interview` (Steps 8-11) per plan §5 Phase 1 / §8 item 6 — "one entry skill, not two." `context.md` now reaches `status: authored` entirely within Phase 1 (previously a Phase 2 job); `next_skill` updated from the deleted `pre-project-interview` to `research` (WS5-B). |
