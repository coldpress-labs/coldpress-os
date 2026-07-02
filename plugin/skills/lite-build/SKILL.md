---
name: lite-build
description: "Lite lane, phase 2 of 4 (Build). Absorbs full-lane P6–P8: red acceptance stubs → implement to green, story by story, in plan mode. Same hooks as the full lane (boundary-guard, quality-gate)."
license: MIT
compatibility: Invoked by @developer
version: "1.0"
---

## Purpose

The lite lane's implementation phase — the full lane's Architecture → Breakdown →
Implementation compressed. No waves, no teams, no formal story graph: Butler
slices `spec.md` into a handful of stories and the **`@developer`** builds them one
at a time. **Same enforcement as the full lane** — the hooks do not relax.

Owner: **`@developer`**, entering in **plan mode**.

## Non-negotiables (★)

1. **Acceptance stubs first** — even 3–5 per story: unit + (for UI) Playwright
   skeletons, **red by construction**, written before the implementation.
2. **boundary-guard** — the active handoff packet's `forbidden` globs are enforced;
   out-of-scope needs become notes in `decisions.md`, not stray edits.
3. **quality-gate** — a story cannot complete while typecheck/lint/test are red.

## Process (per story)

1. Butler issues a handoff packet (scoped spec sections + tokens.json + the story's
   forbidden globs). `@developer` starts in **plan mode**; high-risk work gets Butler
   plan approval before edits.
2. Write the acceptance stubs (red).
3. Implement to green within the packet's boundary. For UI: match tokens.json +
   the styleguide (self-check before completion).
4. `quality-gate` on completion — red = not done.
5. Open questions / out-of-scope discoveries → `decisions.md`.

Hooks live throughout: `boundary-guard`, `quality-gate`, `secret-scan`,
`schema-validate`, `test-integrity`.

## Completion ★

- Every story's stubs are green; the full suite passes; no open blocking questions.

## Handoff

To **Verify** (`lite-verify`): the diff + the acceptance stubs. Butler dispatches
the verifier clean-room — never with the developer's reasoning.
