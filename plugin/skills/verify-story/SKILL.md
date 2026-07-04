---
name: verify-story
description: "Clean-room verify a completed story (P8) against its spec — dispatched ONLY by Butler with the verifier HND packet (spec + acceptance + diff + owns), never the developer's reasoning. Confirms the tests test the spec (no gamed assertions), the diff stays inside the packet's owns globs, and UI matches tokens; writes a schema'd verdict record and runs `coldpress verdict record` so the verdict's failure-taxonomy tags reach the EventStream and `coldpress evolve`'s leaderboard. Read-only: cannot edit code. Runs on OPUS for risk:high / security-registry stories."
license: MIT
compatibility: Invoked by @verifier in Phase 8
disable-model-invocation: true
version: "1.0"
---

## Purpose

Verification only means something if it is **structurally independent**. Butler — not the developer — dispatches this skill with a packet that carries the spec, the acceptance criteria, and the diff, and nothing of the developer's reasoning. The verifier confirms the story meets its spec on those terms alone, writes a machine-readable verdict, and records it so the verdict's failure classes feed the self-improvement loop. Before this skill existed, "verifier on opus for security" and the verdict itself were prose — nothing set the model, nothing schema'd the verdict, and the failure leaderboard stayed empty because no tags ever reached the EventStream.

## When to Use

- At P8, when a story reports complete and `dev-story` hands back to Butler. Butler (not the developer) dispatches `verify-story` with the packet. `disable-model-invocation` keeps it off model-auto-fire — a verifier the developer can summon is not clean-room.

## Prerequisites

- The story is code-complete with tests; a diff exists.
- Butler has the story's `risk` (from the story graph) — `risk: high` / `security_registry` stories force `to.model: opus`.

## Process

1. **Author the verifier packet** (`VerifierPacketSchema`) → `_context/handoffs/verify-{story}-packet.yaml`: `story_id`, `to: { agent: verifier, model }`, `security` (true when `risk: high`), `spec_ref`, `acceptance_ref`, `diff_ref`, and the story's `owns` globs. **`to.model` = `opus` when `security` is true** — the schema *rejects* a security packet on any other model, so verifier-on-opus is enforced, not remembered.

2. **Verify against the packet only:**
   - **Spec conformance** — the acceptance criteria are met by the diff.
   - **No gamed assertions** — the tests test the *spec*, not tautologies; coverage isn't faked.
   - **Diff-in-scope** — every changed path is inside the packet's `owns` globs (the allowlist boundary-guard also enforces).
   - **UI-vs-tokens** — for UI stories, `visual-verify` passes against the styleguide baselines.

3. **Write the verdict record** (`VerifierVerdictSchema`) → `_context/audit/verdicts/{story}-verdict.yaml`: `story_id`, `model`, `verdict` (`pass`/`fail`), `findings[]` (each `kind` + `detail` + optional `taxonomy_tag` from `data/failure-taxonomy.yaml`), and `taxonomy_tags[]`. A `fail` **must** carry ≥1 finding (the schema enforces it).

4. **Record it** — run `coldpress verdict record _context/audit/verdicts/{story}-verdict.yaml`. This validates the record and appends a `verdict` EventStream event carrying the taxonomy tags, so **`coldpress evolve` counts the failure classes** — this is the single step that turns the failure leaderboard live.

5. **Route the outcome** — `pass` → Butler proceeds (merge/next story); `fail` → the findings return to `@developer` for revision, then re-dispatch. The verifier does not edit code.

## Output

The verifier packet + the schema'd verdict record + a recorded `verdict` EventStream event. Feeds the dev-story loop (pass/fail routing), `coldpress evolve` (failure leaderboard, now live), and trace coverage.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-04 | Butler (v0.4 WS10-A4/A5) | NEW P8 producer closing the system-integration audit's A4 **and** A5: no skill wrote the verifier packet, no verdict schema existed, and nothing wrote taxonomy tags to the EventStream (so evolve's failure leaderboard was always empty). Authors the `VerifierPacket` (mechanizing verifier-on-opus via `to.model` — the schema rejects a security packet off opus), writes a schema'd `VerifierVerdict`, and records it via `coldpress verdict record` (new CLI) which appends a `verdict` EventStream event whose tags `coldpress evolve` now counts. `disable-model-invocation` preserves clean-room dispatch. |
