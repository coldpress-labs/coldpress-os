---
name: "dev-story"
description: "Phase 8 core loop — implement one story red-to-green WITHIN its packet boundary: plan-mode entry (Butler approval for risk:high), acceptance-stubs go green without being weakened, styleguide-conformance self-check vs tokens.json for UI, out-of-scope needs become DLT records not stray edits. Completion is gated (can't complete red)."
type: "workflow"
category: "lifecycle"
phase: 8
agent: "developer"
tools: ["Read", "Edit", "Write", "Bash", "Grep", "Glob"]
inputs:
  - "the per-story handoff packet (HND-p7-developer-*): scoped PRD sections, architecture §component, tokens.json + styleguide §components, red acceptance stubs, ownership boundary + forbidden globs"
  - "_context/implementation/stories/ST-*.md (the story contract)"
outputs:
  - artifact: "Implemented code (within the packet boundary)"
    location: "src/"
    format: "code"
  - artifact: "Story record (File List, Change Log, Dev Agent Record, Status)"
    location: "_context/implementation/stories/ST-*.md"
    format: "markdown"
version: "2.0"
---

## Purpose

The Phase 8 per-story loop — the loop that matters most. Take one story from **red acceptance stubs to green**, entirely inside its **ownership boundary**, then hand a clean diff to the clean-room `@verifier`. `dev-story` never self-verifies and never crosses the packet boundary; those are structural guarantees enforced by hooks, not etiquette.

## When to Use

- Butler issues a per-story handoff packet (HND-p7-developer-*) as a wave unblocks.
- A story is `ready-for-dev` in the sprint-status tracking file.
- (Lite lane / bugfix: use `quick-dev` — same hooks, less ceremony.)

## Prerequisites

- The story's **acceptance stubs exist and are red** (written by `acceptance-stubs` at P7, red by construction — unit + Playwright skeletons; UI stories carry computed-style assertions referencing tokens.json).
- The handoff packet defines `owns` / `produces` / `consumes` globs + forbidden paths.
- Walking skeleton + tokens-build output present (UI stories build against tokens by construction).

## Process

**Plan mode first.** Enter in plan mode; a `risk: high` story (security-registry paths) requires **Butler plan approval before any edit**. Then work the loop — see [workflow.md](workflow.md).

Hooks are live for the whole loop and are the real enforcement (not prose):

| Hook | Guarantees |
|------|-----------|
| `boundary-guard` (PreToolUse Edit/Write) | edits stay inside the packet's `owns` globs — a write to a forbidden path is blocked |
| `test-integrity` (PostToolUse) | acceptance stubs can't be weakened/deleted to force green |
| `secret-scan` (PostToolUse) | no credentials committed |
| `schema-validate` (PostToolUse) | schema'd artifacts stay valid |
| `quality-gate` (Stop) | **the story cannot complete red** — full suite must pass |

## Critical Constraints

- **Stay inside the boundary.** An out-of-scope need is a **DLT record** (delta), never a stray edit. Butler reconciles deltas; you don't silently absorb them.
- **Don't weaken the stubs.** Make them pass by implementing the spec — `test-integrity` blocks loosened assertions.
- **UI stories self-check against the styleguide** before completion: the implemented components must match the `/styleguide` route + tokens.json (the same thing `visual-verify` will assert clean-room). Consume tokens via the tokens-build output — divergence should be impossible by construction, not merely caught.
- **Never self-verify.** On completion Butler issues a *fresh* packet to `@verifier` (spec + acceptance + diff only). You do not run the verifier.
- **Never stop for "milestones."** Continue until the story is COMPLETE or a HALT condition (two-consecutive-verifier-fails → human; conflict beyond trivial → re-plan event).

## Output

Green code inside the boundary; story record updated (File List, Change Log, Dev Agent Record, Status → `review`); any out-of-scope needs parked as DLT records. The run-log captures the arc; verifier verdict tags feed the loop.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-07-03 | Butler (v0.4 WS5-E) | REBUILD from the v1.0 BMAD-migrated skill (§5 P8). Anchored to the real v0.4 machinery: plan-mode entry + Butler approval for risk:high; the per-story handoff packet + `owns`/`produces`/`consumes` boundary (boundary-guard hook); acceptance-stubs red-by-construction + test-integrity (can't weaken); quality-gate (can't complete red); styleguide-conformance self-check vs tokens.json for UI stories (consume via tokens-build); out-of-scope needs → DLT records; clean-room verifier hand-off (never self-verify). Frontmatter modernized (packet inputs, tools). |
| 1.0 | 2026-04-13 | Alfred | Migrated from bmad-dev-story, adapted for coldpress-os. |
