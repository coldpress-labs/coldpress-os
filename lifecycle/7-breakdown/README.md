---
phase: 7
name: Breakdown
agent: pm
status: enriched — Phase 7 implementation in progress (autonomous queue unit #9, 2026-04-30)
---

# Phase 7 — Breakdown

> **Cascade rename of old Phase 5 + Shape A scope refinement (2026-04-24).** Same skills as old Phase 5 (epics, stories, parallelization, sprint, readiness). Now consumes a richer upstream: PRD v{latest} + UX-spec + brand-guidelines + sacred architecture + ADRs + prototype manifest.

## Purpose

Phase 7 takes the locked spec stack (PRD + UX + brand + architecture + ADRs + prototype) and decomposes into **atomic implementable work units**. Any architecture-deltas Phase 6 surfaced are already fully reconciled by the time Phase 7 opens (see below). Produces validated epics + per-story files + sacred PERT chart + sprint plan + 9-point implementation-readiness gate.

**Phase 7 is decomposition formalisation atop a complete spec stack** — bridging from "complete spec" to "ready to implement".

## Sub-skills

| Skill | Type | Output | Tier | Owner |
|-------|------|--------|------|-------|
| `story-slice` | workflow | `_context/planning/epics-v{N}.md` + `_context/implementation/stories/ST-*.md` (contracts) + `stories-index.md` | distillate | @pm |
| `story-graph` | workflow | `_context/implementation/story-graph.yaml` + computed `waves.yaml`/`schedule.yaml` (`coldpress waves`) + `_context/tracking/sprint-status-v{N}.md` | distillate | @pm |
| `implementation-readiness` | workflow (gate-style) | `_context/audit/implementation-readiness-v{N}.md` (9-point checklist per Q6) | distillate | @pm |

> **v0.4 (WS5-E):** `create-epics` + `create-stories` merged into **`story-slice`** (slices the three-way-keyed architecture — PRD × components × ADRs — into story contracts with owns/produces/consumes + acceptance-stubs). `parallelization-strategy` rebuilt into **`story-graph`** (authors story-graph.yaml + runs `coldpress waves`). **PERT retired** — the computed wave plan supersedes the old sacred PERT chart.

## Recommended flow

```
[Phase 6 exit: architecture sacred + ADRs incl. flagged-delta ADRs]
        │
        ▼
   phase-transition step-02a §B — architecture-deltas reconciliation
     - 4-option reconciliation per delta; accept_into_prd → validate-prd --sections lightweight amendment
     - Phase 6 exit blocks on reject / flag_for_architecture_ADR until resolved
        │  (writes phase-6-to-7 handoff with a fully-resolved architecture_deltas: section)
        ▼
   story-slice (epics → ST-* contracts + acceptance-stubs)  →  story-graph (story-graph.yaml + coldpress waves + tracking)  →  implementation-readiness
                                                                                                       (gate-style 9-point)
        │
        ▼
   phase-transition (writes phase-7-to-8 handoff)
        │
        ▼
   [Phase 8 entry — @developer]
```

## Architecture-deltas reconciliation pass

Phase 6 may have surfaced PRD/UX gaps at architecture time and recorded them as `architecture_delta` entries in the Phase 6 `architecture-design` WIP log (forward-carry from Phase 6 deep-dive §12). `phase-transition` step-02a §B reconciles them **at Phase 6 EXIT** (WS5-B, §8 item 6 — folded in from the deleted `breakdown-entry-sync` Phase 7 entry skill, since phase-transition already owns the handoff/delta schema plumbing) — same 4-option pattern as Phase 5 design-deltas (accept_into_prd / reject / flag_for_architecture_ADR / park_for_phase_11). For accept_into_prd: invoke `validate-prd --sections=<list>` (first real consumer of this lightweight-amendment path); bump PRD VC to v(N+1). Phase 7 always opens with a fully-resolved delta set — `coldpress trace orphans` (block-severity at Phase 7 exit) is the mechanical backstop if anything were ever left unresolved.

Schema: reuses `schemas/handoffs/design-delta.schema.json` with `source_skill: architecture-design`.

## Entry conditions

1. Phase 6 gate passed (incl. silent-divergence guard at #5).
2. `architecture.md` sacred + locked.
3. ADRs from Phase 3 + Phase 6 present.
4. PRD locked.
5. UX-spec + brand-guidelines validated; prototype manifest exists.
6. `phase-6-to-7-{date}.md` handoff written, with a fully-resolved `architecture_deltas:` section (reconciled at Phase 6 exit — see below, not a Phase 7 entry step).

## Exit conditions

See `gate.json` (9 acceptance checks — was 11, undercounted as "10" even before this change; WS5-B dropped `breakdown-scope-emitted` and `architecture-deltas-resolved`; the latter is now enforced at Phase 6 exit by `phase-transition`, and the former's content lives in the handoff/coldpress.yaml directly rather than a separate memo). Summary:

- `architecture-locked` re-verified
- `epics-validated`
- `stories-validated` (per-story files + index)
- `pert-chart-sacred` (PERT is sacred-doc)
- `sprint-status-validated`
- **`implementation-readiness-pass`** (9-point structured checklist)
- `prd-user-story-coverage-complete`
- `phase-7-handoff-written`
- **`trace-orphans-clean`** (`coldpress trace orphans` — also the mechanical backstop for unresolved deltas)

## Agent

**@pm** owns all 4 skills throughout — no sub-persona hand-off (the former @scrum-master sprint-planning ceremony, Pattern 7 `#8a`/`#8b`, was retired WS5-B §8 item 6). Pattern 7 transitions:
- #8: phase_entry — phase-transition → @pm (warm_handoff: phase-6-to-7)
- #9: phase_exit — @pm → phase-transition
- #10: phase_entry (Phase 8) — phase-transition → @developer (warm_handoff: phase-7-to-8)

## Cross-cutting wire-ins

- `adversarial-review` — story scope challenge; PERT critical-path challenge
- `editorial` — epics + stories + PERT structure check
- `editorial` — story prose polish

## Method playbook

See `data/methods/method-defaults.yaml` `phase_7:` section. Tier-1 wired-in methods:
- `story_types` (heavy — user_stories / job_stories / bdd_scenarios / acceptance_criteria with archetype-conditional selection per Q5)
- `problem_solving` (heavy — first_principles + scenario_planning + failure_mode_analysis for PERT + readiness)
- `brainstorming` (medium — round_robin + mind_mapping for epic decomposition)
- `advanced_elicitation` (medium — vague_acceptance_criteria + vague_story_scope triggers)
- `design_thinking` (low — define stage at epic-grouping)

## Source

- Deep-dive: [`docs/lifcyle-phases-deep-dives/phase-7-deep-dive-2026-04-30.md`](../../docs/lifcyle-phases-deep-dives/phase-7-deep-dive-2026-04-30.md) v1.0
- Implementation plan: [`docs/phase-ii-implementation-plan.md` Part 7](../../docs/phase-ii-implementation-plan.md) v1.23

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 4.0 | 2026-07-02 | Butler | WS5-B (§8 item 6) — `sprint-planning` deleted; its mechanical sprint-status generation (parse epics → detect statuses → generate) folds into `parallelization-strategy` as Steps 4-6, dropping the @scrum-master sub-persona ceremony (Pattern 7 `#8a`/`#8b`). Sub-skills table (5→4 skills), flow diagram, and Agent section updated. `sub_agent: scrum-master` frontmatter removed. |
| 3.0 | 2026-07-02 | Butler | WS5-B (§8 item 6) — `breakdown-entry-sync` deleted; its architecture-deltas reconciliation role moves to `phase-transition` step-02a §B (Phase 6 exit, same pattern as Phase 5 design-deltas); its context-load + scope-memo roles are replaced by direct reads (coldpress.yaml/state.yaml + the handoff). Sub-skills table, flow diagram, entry/exit conditions, and Agent section updated. Corrected the exit-condition check count (was mis-stated as 10; actually 11 before this change, 9 after). |
| 2.0 | 2026-04-30 | Butler (Andy-coldpress-os under autonomous queue unit #9 Wave 7.1) | Phase 7 README enriched. Cascade-rename + Shape A scope refresh framing. Sub-skills table now includes NEW breakdown-entry-sync (per Q1). Recommended-flow ASCII with 6 skills. Entry/exit conditions reflect Shape A richer upstream. Architecture-deltas reconciliation explainer. @scrum-master sub-persona ownership for sprint-planning (Pattern 7 sub_phase_boundary transitions #8a + #8b). 10 gate checks summarised. Method playbook tier-1 listing. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial Phase 5 (now 7) Breakdown README. |
