---
name: lite-spec
description: "Lite lane, phase 1 of 4 (Spec). Absorbs full-lane P1–P4 (+P5 lightly) into one pass: ingest → understand → lock stack+deploy → walking skeleton → a single spec.md. Ceremony compressed; safety kept."
license: MIT
compatibility: Invoked by @butler
allowed-tools: "Read Write Bash WebSearch"
version: "1.0"
---

## Purpose

The lite lane's understanding phase. It collapses the full lane's Bootstrap →
Discovery → Tech-Stack → Planning (and a light touch of Design) into **one** pass
that produces a single `spec.md` instead of the five-doc sacred set. **The lane
changes ceremony, never safety** — the non-negotiables below are kept.

Owner: **Butler**, with **one `@analyst` dispatch** for research when the domain
needs it. Not a heavyweight multi-agent sequence.

## Non-negotiables (★ — never dropped, even in lite)

1. **Ingest ledger** — every `_input/` file gets an ingest record or an explicit skip note.
2. **Lane + security-tier recorded** in `coldpress.yaml` + `.coldpress/state.yaml` (tier drives everything downstream).
3. **Stack + deploy lock** — the stack pack and deploy pack are chosen and recorded (not left implicit).
4. **Walking skeleton** — hello-world deployed to *staging* before Build begins. The single best de-risking step; never cut.
5. **tokens.json + a one-page styleguide** — if the project has *any* UI. Build's `visual-verify` has nothing to assert against otherwise.

## Process

1. **Intake** — solicit/collect material into `_input/`; structured elicitation
   (what / who / why / constraints / budget / deadline). First question is the
   project profile (pre-fills lane, tier, packs). Write the ingest ledger.
2. **Understand** — a bounded pass: who it's for, what exists, what's risky. One
   `@analyst research` dispatch if the domain warrants it (depth: standard).
   Kill bad ideas while they're cheap.
3. **Lock stack + deploy** — classify → pick the stack pack + deploy pack →
   record in `coldpress.yaml`. License scan at lock.
4. **Walking skeleton** ★ — provision + deploy a hello-world to staging (returns 200).
5. **Design-lite** — if there's UI: emit `_context/design/tokens.json` + a
   one-page `styleguide.md` (the enforcement contract for Build's visual-verify).
6. **Write `spec.md`** — one sacred doc: context + PRD-lite (numbered requirements
   with acceptance criteria + priority) + the locked stack. Open questions go to
   `decisions.md` (lite drops formal delta records — decisions.md is the log).

## Completion ★

- `spec.md` present; every requirement has an acceptance criterion + priority.
- lane + tier recorded; ingest ledger complete; stack + deploy locked.
- walking skeleton returns 200 on staging.
- tokens.json + one-page styleguide present *if any UI*.
- **Human gate:** proceed / kill.

## Handoff

To **Build** (`lite-build`): `spec.md` (scoped to the requirements being built) +
tokens.json/styleguide if UI. Butler issues per-story handoff packets.

## Upgrade path

Need the full lane later? `coldpress lane-upgrade` back-fills the five full-lane
sacred docs from `spec.md` + `decisions.md` without data loss.
