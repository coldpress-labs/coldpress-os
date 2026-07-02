---
name: lite-verify
description: "Lite lane, phase 3 of 4 (Verify). The full lane's verification half, unchanged: a structurally-independent @verifier checks the build against spec + tokens and emits a verdict record. Lite changes ceremony, never verification."
license: MIT
compatibility: Invoked by @verifier
allowed-tools: "Read Grep Glob Bash"
version: "1.0"
---

## Purpose

The lite lane's verification phase. Verification is a **safety** property, so it is
**not** relaxed in lite — the same structurally-independent verifier the full lane
uses runs here. Owner: **`@verifier`**, dispatched by **Butler only** (never
sub-dispatched by the developer — the author does not grade its own homework).

## Non-negotiables (★)

1. **Clean-room dispatch** — the verifier receives spec + acceptance + diff, never
   the developer's reasoning. Tools: Read/Grep/Glob/Bash (no Edit/Write).
2. **visual-verify vs tokens** (UI) — Playwright screenshots + computed-style
   assertions against `tokens.json` and the one-page styleguide.
3. **Verdict record** — a schema'd `pass | fail(reasons[], taxonomy_tags[])`.

## Process

1. Butler issues a **fresh** handoff to `@verifier`: spec + acceptance + diff only.
2. The verifier runs: the acceptance stub suite; `visual-verify` (UI); a semantic
   pass (do the tests test the spec? no gamed assertions?); a scope pass
   (`coldpress trace why` on each changed file — diff within its lane?).
3. Emit the verdict. **Fail** → Butler re-dispatches `@developer` with the findings
   only (the verifier stays clean for round 2). Two consecutive fails → escalate to
   the human with both summaries.
4. `run-log` captures the arc; taxonomy tags feed the evolution loop.

## Completion ★

- Verdict `pass`; the full suite green.

## Handoff

To **Ship** (`lite-ship`): the release scope (verified stories + verdicts).
