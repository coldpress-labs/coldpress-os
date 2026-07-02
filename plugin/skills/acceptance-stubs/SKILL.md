---
name: acceptance-stubs
description: Per story, write the acceptance test skeletons BEFORE implementation — unit-test stubs + Playwright spec skeletons, red by construction. For UI stories, computed-style assertions referencing tokens.json. The contract the developer implements to and the verifier runs.
license: MIT
compatibility: Invoked by @developer
allowed-tools: "Read Write Bash"
version: "1.0"
---

## Purpose

Turn each story's acceptance criteria into **executable, red-by-construction**
tests *before* any implementation. This is what makes a story a contract: the
developer implements to green, and the verifier runs the same stubs clean-room.
Written at Breakdown (P7) / at the start of a Build story (lite lane).

## Process

1. **One stub per acceptance criterion.** For each numbered criterion in the story,
   write a failing test that encodes it:
   - **Unit** — the smallest assertion that proves the criterion (`expect(...)`,
     initially failing / `todo`).
   - **e2e** (critical flows) — a Playwright spec skeleton driving the user path.
2. **UI stories** — add computed-style assertions that reference `tokens.json`
   (e.g. the component's color/font-size must equal a token value). These pair
   with `visual-verify`.
3. **Red by construction.** Every stub must fail before implementation exists —
   run the suite and confirm red. A stub that passes empty is not a stub.
4. **Manifest.** Record `_context/implementation/{story}.tests.md` listing each
   criterion → its stub(s), so `coldpress trace` can check coverage (a story
   without stubs is a P7 orphan).

## Guardrails

- Do **not** weaken or delete a stub to make it pass — the `test-integrity` hook
  flags that. Fix the implementation, not the test.
- Regression pinning: when the verifier later catches a bug, a pinning test is
  added here before its fix merges.

## Completion

- Every acceptance criterion has ≥1 stub; the suite is red; the manifest exists.
