---
step_number: 4
step_name: "Validate"
step_goal: "Coverage check (trace orphans); write stories-index; present to user"
halts_for_input: true
next_step: null
---

## Goal

Prove the slice is complete before `story-graph` wires it.

## Instructions

1. **Coverage** — every P0/P1 requirement maps to ≥1 story. Run `trace orphans`;
   an unmapped requirement is a gap → resolve before proceeding.
2. **Contract completeness** — every `interface` surface in the api-contract has a
   contract story; every security-registry path is covered by a `risk: high` story.
3. **Stub presence** — every story has red acceptance stubs.
4. **Write `stories-index.md`** — the aggregate: story id, epic, requirement IDs,
   owns globs, risk, estimate, stub status.
5. **`editorial` finalisation** pass, then **present to the user**: epic/story
   counts, coverage summary, risk distribution, any open questions.

## Output

`stories-index.md` + a validated story set. Halts for user review. Hand off to
`story-graph` (dependency wiring + `coldpress waves`) then `implementation-readiness`.
