---
name: story-slice
description: "Phase 7 — slice PRD requirements × architecture components into stories that are CONTRACTS: user-value epics, then atomic stories of ~½–2 dev-sessions, each with owns/produces/consumes globs, o/m/p estimates, risk (forced high on security-registry paths), styleguide component refs (UI), attached analytics events, and red acceptance stubs. Contract stories extract from the P6 api-contract; content-population stories from the PRD content inventory."
license: MIT
compatibility: Invoked by @pm in Phase 7
allowed-tools: "Read Write Bash Grep Glob"
version: "1.0"
---

## Purpose

The Phase 7 slicer — turns the spec into **stories that are contracts**. It merges
the old `create-epics` (grouping) and `create-stories` (atomic authoring) into one
skill so slicing happens in a single pass. It slices the **three-way-keyed
architecture** produced at Phase 6 — PRD requirement IDs ↔ components ↔ styleguide
components, with ADRs locking the decisions — into stories that `story-graph` can
wire and `dev-story` can execute inside a boundary. The PRD says *what*, the
architecture says *how it decomposes* (giving each story its `owns` file globs), and
ADRs say *what's already decided*; slicing needs all three. Parallelism isn't decided
here — it's *enabled* here by the per-story `owns`/`produces`/`consumes` metadata that
`story-graph` + `coldpress waves` consume.

## When to Use

- Phase 7 entry — once the phase-6-to-7 handoff exists (architecture-deltas already
  reconciled at Phase 6 exit via `phase-transition` step-02a §B).
- Runs before `story-graph` (which needs the sliced stories) and `implementation-readiness`.

## Prerequisites

- PRD locked (possibly v(N+1) post-architecture-delta reconciliation) + architecture sacred + locked.
- P6 artifacts present where applicable: `api-contract` (API projects), `security-registry.yaml`, `analytics-plan`, `data-model`; P5 `tokens.json` + `styleguide.md` + `ux-spec.md`.

## Process

Five steps — see [workflow.md](workflow.md):

1. **Context** — load PRD + architecture + UX-spec + tokens/styleguide + api-contract + security-registry + analytics-plan from the handoff.
2. **Epics** — group requirements into user-value epics, each mapping PRD requirement IDs ↔ architecture components ↔ UX flows.
3. **Stories** — slice each epic into atomic `ST-*.md` stories (~½–2 dev-sessions). **Every story carries** (the contract):
   - `owns` / `produces` / `consumes` globs (the ownership boundary `dev-story`'s boundary-guard enforces),
   - o/m/p estimates (optimistic/most-likely/pessimistic — feed `coldpress waves` critical path),
   - `risk` — **forced `high`** when the story touches a `security-registry.yaml` path (→ solo dispatch + opus verify at P8),
   - **styleguide component references** for UI stories (keyed to `styleguide.md` + tokens.json),
   - attached **analytics events** from the P6 analytics-plan (→ P9 smoke asserts they fire),
   - keyed to the requirement IDs it satisfies (so `trace orphans` can gate).
   - **Contract stories** are extracted from the P6 `api-contract` (each `interface` surface → a contract story that merges before its wave). **Content-population** stories are generated from the PRD content inventory (content-led sites), with owners + deadlines.
4. **Stubs** — invoke `acceptance-stubs` per story: unit + Playwright skeletons, **red by construction** (UI stories get computed-style assertions referencing tokens.json). Written before implementation.
5. **Validate** — coverage check (every P0/P1 requirement → ≥1 story; `trace orphans` clean), write `stories-index.md`, present to the user.

## Output

`epics-v{N}.md`, per-story `ST-*.md` contracts + `ST-*.tests.md` red stubs, `stories-index.md`. Handed to `story-graph` (dependency wiring + waves) then `implementation-readiness` (exit gate).

## Cross-cutting wire-ins

- `editorial` — Step 5 finalisation polish
- `brainstorming` / `design-thinking` — Step 2 epic decomposition

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS5-E) | NEW — merges `create-epics` + `create-stories` into one Phase 7 slicer (§5 P7). Adds the v0.4 story-as-contract metadata: `owns`/`produces`/`consumes` globs, o/m/p estimates, `risk` forced-high on security-registry paths, styleguide component refs (UI), attached analytics events, requirement-ID keying; contract-story extraction from the P6 api-contract; content-population stories from the PRD content inventory; `acceptance-stubs` integration (red by construction). Absorbs both predecessors' graph-first context load + validation. Outputs relocated to `_context/implementation/stories/ST-*.md`. |
