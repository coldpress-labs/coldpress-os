---
phase: 11
name: Evolve
agent: reviewer
status: rewritten — Phase 11 implementation in progress (autonomous queue unit #19, 2026-05-02; FINAL UNIT)
is_final_phase: true
---

# Phase 11 — Evolve

> **FINAL phase of the canonical 11-phase lifecycle.** Cascade rename of old Phase 9 + Shape A scope refinement (2026-04-24). Same 3 skills, owner @reviewer (takeover from @devops at Phase 10 → 11 transition #18).

## Purpose

**Phase 11 is point-in-time reflection.** Distinct from Phase 10's continuous in-flight work:
- Retrospective — what worked / what didn't / lessons learned (reads ops_deltas + cause analysis)
- Product-evolution — backlog of next-iteration improvements
- Innovation-strategy — long-horizon strategic ideation

**Consumes ops_deltas[]** from Phase 10 handoff (fourth forward-carry). Reconciles them via 4-option resolution (accept_into_phase_11_retrospective / accept_into_phase_11_product_evolution / immediate_corrective_action / park_for_phase_11) at retrospective Step 0.

**Phase 11 is FINAL** — no phase-12-handoff. Outputs feed NEXT iteration's Phase 1 entry via `_input/prior-iteration/`.

## Sub-skills

| Skill | Type | Owner |
|-------|------|-------|
| `retrospective` | workflow | @reviewer (entry skill per Q1) — **rebuilt (WS8):** product+process, evidence-linked (cites run-log event IDs), reads outcomes actual-vs-target + failure-lineage via `trace`; @reviewer on opus |
| `product-evolution` | workflow | @reviewer (next-iteration product backlog) |
| `framework-feedback` | workflow | @reviewer — **NEW (WS8)**. Framework-attributable learnings → issues against coldpress-os (the WS7 valet-loop intake): taxonomy summary + override review + proposed skill/hook/schema patches |
| `pack-harvest` | workflow | @reviewer — **NEW (WS8, principle 7)**. Graduate what worked (components/snippets/config/skills/golden evals) into the relevant pack, or propose a new profile when a shape ships first |

## Recommended flow

```
[Phase 10 exit: user-invoked retrospective trigger; ops_deltas[] in phase-10-to-11 handoff]
        │
        ▼
   retrospective (Step 0 — graph-first context + entry-sync + ops-deltas reconciliation)
        │
        ▼
   product-evolution (consumes accept_into_phase_11_product_evolution deltas + retro lessons)
        │
        ▼
   framework-feedback (framework learnings → coldpress-os issues; WS7 loop intake)
        │
        ▼
   pack-harvest (graduate what worked → the relevant pack / a new profile)
        │
        ▼
   phase-transition (FINAL closure — copies outputs to _input/prior-iteration/ for NEXT iteration)
        │
        ▼
   [Iteration COMPLETE]
   [If user invokes next iteration: Phase 1 entry reads _input/prior-iteration/]
```

## Entry conditions

1. Phase 10 user-invoked exit (retrospective trigger).
2. phase-10-to-11 handoff written (with ops_deltas[]).

## Exit conditions

See `gate.json` (4 acceptance checks). Final phase — no phase-12 link.

## Inter-iteration cycle (final phase mechanism)

Phase 11 closure (phase-transition step-03-handoff-log) copies outputs to `_input/prior-iteration/`:
- `retrospective.md`
- `product-evolution-backlog.md`
- `framework-feedback-v{N}.md` (+ issues on coldpress-os)
- `pack-harvest-v{N}.md`

NEXT iteration's Phase 1 entry reads `_input/prior-iteration/` (brownfield-style branching). Lifecycle is non-cyclic by default but supports re-entry for next iteration.

## Agent

**@reviewer** — Pattern 7 transition #18 from @devops at Phase 11 entry. Final phase; transition #19 phase_exit @reviewer → phase-transition (closure log). NO transition #20 in current iteration.

## Cross-cutting wire-ins

- `adversarial-review` — retrospective challenge (red-team lessons)
- `editorial` — retro report + backlog structure
- `editorial` — retrospective prose

## Method playbook

See `data/methods/method-defaults.yaml` `phase_11:` section. Tier-1: problem_solving heavy (root_cause + five_whys + fishbone for retrospective cause-analysis); brainstorming heavy (innovation-strategy + product-evolution); design_thinking medium (innovation-strategy framing); story_types medium (value_prop_narrative for innovation; feature_story for product-evolution); advanced_elicitation medium.

## Source

- Deep-dive: [`docs/lifcyle-phases-deep-dives/phase-11-deep-dive-2026-05-02.md`](../../docs/lifcyle-phases-deep-dives/phase-11-deep-dive-2026-05-02.md) v1.0
- Implementation plan: [`docs/phase-ii-implementation-plan.md` Part 11](../../docs/phase-ii-implementation-plan.md) v1.27

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (Andy-coldpress-os under autonomous queue unit #19; FINAL UNIT) | Phase 11 README enriched. Cascade-rename + Shape A scope refresh framing. **FINAL phase** of canonical 11-phase lifecycle. ops-deltas reconciliation at retrospective Step 0 (consumes 4th forward-carry from Phase 10). Inter-iteration cycle mechanism (outputs → _input/prior-iteration/ for NEXT iteration's Phase 1). Pattern 7 seventh + final invocation (#18 entry / #19 exit; no #20 in current iteration). |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial Phase 9 (now 11) Evolve README. |
