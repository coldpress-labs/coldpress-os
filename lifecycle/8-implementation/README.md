---
phase: 8
name: Implementation
agent: developer
sub_agent: verifier
status: rewritten — Phase 8 implementation in progress (autonomous queue unit #12, 2026-05-02)
---

# Phase 8 — Implementation

> **Cascade rename of old Phase 6 (Implementation) + Shape A scope refinement (2026-04-24).** Same 9 skills, same owner (@developer, who implements + authors tests, with @verifier sub-persona for code-review). Now consumes a fully-specified upstream stack: PRD + UX-spec + brand-guidelines + sacred architecture + ADRs + sacred PERT chart + per-story files + sprint-status + prototype manifest.

## Purpose

**Phase 8 is execution + verification.** Wave-by-wave story-by-story:
- Read story file (per-story file from Phase 7)
- Reference prototype-manifest for code-skeleton starting point
- Implement per acceptance criteria (BDD or AC depending on archetype)
- Author tests per archetype-conditional discipline
- Code-review per story (@verifier sub-persona)
- Update sprint-status as stories complete

CI pipeline set up once at phase entry; per-wave gate evaluation.

## Sub-skills

The wave schedule is **computed at Phase 7** by `coldpress waves` (from `story-graph.yaml`) — there is no separate P8 orchestration skill. Butler reads that schedule and dispatches `dev-story` per story, wave by wave.

| Skill | Type | Owner | Notes |
|-------|------|-------|-------|
| `ci-pipeline` | workflow | @developer | Pre-Wave-1 setup once per Q5 |
| `test-framework` | workflow | @developer | One-time setup; Pattern 7 sub-transition #11a |
| `test-design` | workflow | @developer | Per-story test strategy |
| `dev-story` | workflow | @developer | Per-story execution; reads story.archetype_granularity per Q2 |
| `quick-dev` | workflow | @developer | Light dev for vibe-coder-lean per Q3 |
| `atdd` | workflow | @developer | Per-story ATDD authoring; standard / WDS only per Q3 |
| `qa-automation` | workflow | @developer | Per-wave automated testing |
| `code-review` | workflow | @verifier | Per-story; adversarial-review wire-in per Q6 |

## Recommended flow

```
[Phase 7 exit: story-graph.yaml + coldpress waves computed + stories validated + sprint-status + readiness pass]
        │
        ▼
   Butler reads the computed `coldpress waves` schedule (P7)
     │
     ├──→ ci-pipeline (one-time setup; locks CI config)
     ├──→ test-framework (one-time setup; @developer test-authoring)
     │
     ▼
   FOR each wave in the computed schedule:
     Butler dispatches per-story → per-story flow:
     │
     ▼
   FOR each story in wave:
     dev-story (or quick-dev for thin archetype)
       ├──→ test-design (per-story strategy)
       ├──→ atdd (if standard / WDS)
       ├──→ implement code
       ├──→ qa-automation (run tests)
       ├──→ code-review (@verifier sub-transition; recurring per story)
        │
        ▼
   sprint-status update (per wave)
        │
        ▼
   [last wave complete]
        │
        ▼
   phase-transition
     ├── Step 2a: implementation-deltas reconciliation (if any)
     └── Step 3: phase-8-to-9 handoff
        │
        ▼
   [Phase 9 entry — @devops Deployment]
```

## Implementation-deltas reconciliation pass (third forward-carry instance)

Phase 5 design-deltas reconcile at Phase 5 EXIT. Phase 7 architecture-deltas reconcile at Phase 7 ENTRY (mirror — caught at boundary of next phase). Phase 8 implementation-deltas reconcile at Phase 8 EXIT (mirror of Phase 5; deltas surface during execution; reconcile at the same phase's exit).

Schema reuses `design-delta.schema.json` with `source_skill: dev-story | quick-dev | code-review | qa-automation`. 4 reconciliation_options. accept_into_prd → `validate-prd --sections` lightweight amendment (well-trodden path by Phase 8). flag_for_architecture_ADR at Phase 8 should be RARE — silent-divergence guard breach signal; re-enter Phase 6.

## Entry conditions

1. Phase 7 gate passed (incl. implementation-readiness 9-point all pass).
2. PERT sacred + locked.
3. All per-story files validated; stories-index complete.
4. `phase-7-to-8-{date}.md` handoff written.

## Exit conditions

See `gate.json` (8 acceptance checks). Summary: pert-locked re-verified; all-stories-complete; sprint-status-final; code-review-passed-all-stories; tests-passing; implementation-deltas-resolved; ci-pipeline-locked (warn); phase-8-handoff-written.

## Agent

**@developer** primary (implements + authors tests); **@verifier** sub-persona for code-review. Pattern 7 fourth invocation:
- #11: phase_entry — phase-transition → @developer
- #11a: sub_phase_boundary — @developer → @verifier (code-review per story; recurring)
- #11b: sub_phase_boundary — @verifier → @developer
- #12: phase_exit — @developer → phase-transition
- #13: phase_entry (Phase 9) — phase-transition → @devops

## Cross-cutting wire-ins

- `adversarial-review` — code-review (per Q6); challenge implementation, edge-case-hunter
- `editorial` — code-comment polish
- `editorial` — test-spec structure, code-review report structure

## Method playbook

See `data/methods/method-defaults.yaml` `phase_8:` section. Tier-1: problem_solving heavy (first_principles + failure_mode_analysis + scenario_planning + root_cause); advanced_elicitation medium (vague_test_strategy + vague_code_architecture_tradeoff); brainstorming low; design_thinking low; story_types low.

## Source

- Deep-dive: [`docs/lifcyle-phases-deep-dives/phase-8-deep-dive-2026-05-02.md`](../../docs/lifcyle-phases-deep-dives/phase-8-deep-dive-2026-05-02.md) v1.0
- Implementation plan: [`docs/phase-ii-implementation-plan.md` Part 8](../../docs/phase-ii-implementation-plan.md) v1.24

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (Andy-coldpress-os under autonomous queue unit #12 Wave 8.1) | Phase 8 README enriched. Cascade-rename + Shape A scope refresh framing. 9 sub-skills with @qa sub-persona pattern. Recommended-flow ASCII showing wave-orchestration as entry skill (Q1) + per-story dev-story → test → code-review pattern. Implementation-deltas reconciliation explainer (third forward-carry instance). Pattern 7 fourth invocation table (7 transitions). 8 gate checks summary. |
| 1.0 | 2026-04 (pre-Shape-A) | Alfred | Initial Phase 6 (now 8) Implementation README. |
