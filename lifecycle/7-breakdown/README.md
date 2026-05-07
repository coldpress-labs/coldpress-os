---
phase: 7
name: Breakdown
agent: pm
sub_agent: scrum-master
status: enriched — Phase 7 implementation in progress (autonomous queue unit #9, 2026-04-30)
---

# Phase 7 — Breakdown

> **Cascade rename of old Phase 5 + Shape A scope refinement (2026-04-24).** Same skills as old Phase 5 (epics, stories, parallelization, sprint, readiness) + 1 NEW (`breakdown-entry-sync`). Now consumes a richer upstream: PRD v{latest} + UX-spec + brand-guidelines + sacred architecture + ADRs + prototype manifest.

## Purpose

Phase 7 takes the locked spec stack (PRD + UX + brand + architecture + ADRs + prototype) and decomposes into **atomic implementable work units**. Reconciles any architecture-deltas Phase 6 surfaced (forward-carry mechanism). Produces validated epics + per-story files + sacred PERT chart + sprint plan + 9-point implementation-readiness gate.

**Phase 7 is decomposition formalisation atop a complete spec stack** — bridging from "complete spec" to "ready to implement".

## Sub-skills

| Skill | Type | Output | Tier | Owner |
|-------|------|--------|------|-------|
| `breakdown-entry-sync` (NEW) | workflow | `_context/planning/breakdown-scope-v{N}.md` + (conditional) PRD v(N+1) lightweight amendment | distillate | @pm |
| `create-epics` | workflow | `_context/planning/epics-v{N}.md` | distillate | @pm |
| `create-stories` | workflow | `_context/implementation/stories/story-NNN-*-v{N}.md` (per Q4) + `stories-index.md` | distillate (per story) | @pm |
| `parallelization-strategy` | workflow | `_context/sacred/pert-chart.md` (SACRED per Q3) + sidecar | sacred | @pm |
| `sprint-planning` | workflow | `_context/tracking/sprint-status-v{N}.md` | distillate | @scrum-master |
| `implementation-readiness` | workflow (gate-style) | `_context/audit/implementation-readiness-v{N}.md` (9-point checklist per Q6) | distillate | @pm |

## Recommended flow

```
[Phase 6 exit: architecture sacred + ADRs incl. flagged-delta ADRs; architecture-deltas WIP if any]
        │
        ▼
   breakdown-entry-sync  (NEW)
     ├── Step 0: graph-first context load + 6th-consumer staleness check
     ├── Step 1: architecture-deltas reconciliation (Q2 — at entry, not exit)
     │   - 4-option reconciliation per delta; accept_into_prd → validate-prd --sections lightweight amendment
     └── Step 2: breakdown-scope memo emit
        │
        ▼
   create-epics  →  create-stories  →  parallelization-strategy  →  sprint-planning  →  implementation-readiness
                                                                   (@scrum-master)        (gate-style 9-point)
        │
        ▼
   phase-transition (writes phase-7-to-8 handoff)
        │
        ▼
   [Phase 8 entry — @developer]
```

## Architecture-deltas reconciliation pass

Phase 6 may have surfaced PRD/UX gaps at architecture time and recorded them as `architecture_delta` entries in the phase-6-to-7 handoff (forward-carry from Phase 6 deep-dive §12). Phase 7 entry-sync Step 1 reconciles them — same 4-option pattern as Phase 5 design-deltas (accept_into_prd / reject / flag_for_architecture_ADR / park_for_phase_11). For accept_into_prd: invoke `validate-prd --sections=<list>` (first real consumer of this lightweight-amendment path); bump PRD VC to v(N+1).

Schema: reuses `schemas/handoffs/design-delta.schema.json` with `source_skill: architecture-design`.

## Entry conditions

1. Phase 6 gate passed (incl. silent-divergence guard at #5).
2. `architecture.md` sacred + locked.
3. ADRs from Phase 3 + Phase 6 present.
4. PRD locked.
5. UX-spec + brand-guidelines validated; prototype manifest exists.
6. `phase-6-to-7-{date}.md` handoff written.

## Exit conditions

See `gate.json` (10 acceptance checks). Summary:

- `architecture-locked` re-verified
- `breakdown-scope-emitted`
- **`architecture-deltas-resolved`** (every Phase-6-surfaced delta has user_decision)
- `epics-validated`
- `stories-validated` (per-story files + index)
- `pert-chart-sacred` (PERT is sacred-doc)
- `sprint-status-validated`
- **`implementation-readiness-pass`** (9-point structured checklist)
- `prd-user-story-coverage-complete`
- `phase-7-handoff-written`

## Agent

**@pm** owns 5 of 6 skills (entry-sync, epics, stories, PERT, readiness). **@scrum-master** sub-persona owns sprint-planning. Pattern 7 transitions:
- #8: phase_entry — phase-transition → @pm (warm_handoff: phase-6-to-7)
- #8a: sub_phase_boundary — @pm → @scrum-master (sprint-planning entry)
- #8b: sub_phase_boundary — @scrum-master → @pm (sprint-planning exit)
- #9: phase_exit — @pm → phase-transition
- #10: phase_entry (Phase 8) — phase-transition → @developer (warm_handoff: phase-7-to-8)

## Cross-cutting wire-ins

- `adversarial-review` — story scope challenge; PERT critical-path challenge
- `editorial-structure` — epics + stories + PERT structure check
- `editorial-prose` — story prose polish

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
| 2.0 | 2026-04-30 | Butler (Andy-coldpress-os under autonomous queue unit #9 Wave 7.1) | Phase 7 README enriched. Cascade-rename + Shape A scope refresh framing. Sub-skills table now includes NEW breakdown-entry-sync (per Q1). Recommended-flow ASCII with 6 skills. Entry/exit conditions reflect Shape A richer upstream. Architecture-deltas reconciliation explainer. @scrum-master sub-persona ownership for sprint-planning (Pattern 7 sub_phase_boundary transitions #8a + #8b). 10 gate checks summarised. Method playbook tier-1 listing. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial Phase 5 (now 7) Breakdown README. |
