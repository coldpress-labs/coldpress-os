---
phase: 5
name: Design
agent: ux-designer
status: scaffolded — Phase 5 implementation in progress (autonomous queue unit #3, 2026-04-30)
---

# Phase 5 — Design

> **NEW phase under Shape A (2026-04-24).** Pre-Shape-A, the framework was 9-phase with Phase 4 Planning bundling PRD + UX + architecture under @pm orchestration. Shape A splits planning into Phase 4 Planning (PRD only, @pm), **Phase 5 Design (this phase, @ux-designer)**, and Phase 6 Architecture (@architect).

## Purpose

Phase 5 takes the locked PRD from Phase 4 plus Phase 2 personas and Phase 3 baselines, and converts them into experience specifications: design-brief, UX design spec, brand-guidelines, and prototype. Phase 5 exit triggers a **PRD reconciliation pass** that converts design-discoveries (design-deltas) into PRD v2 via lightweight amendment, with `flag_for_architecture_ADR` as a silent-divergence guard enforced at Phase 6 entry.

**Phase 5 is experience formalisation, not free-form design exploration.** Every Phase 5 skill reads PRD v1 + Phase 2 personas + Phase 1 intake + Phase 3 baselines (especially accessibility) before authoring.

Narrative/brand-voice work (product story, persona scenarios, value-prop narrative, brand-voice samples) is available on demand via `skills/creative/storytelling` — the dedicated `narrative` wrapper skill was retired (WS5-B, §8 item 6); it isn't a gated Phase 5 deliverable.

## Sub-skills

| Skill | Type | Output | Tier | Required? |
|-------|------|--------|------|-----------|
| `design-brief` | workflow | `_context/planning/design-brief-v{N}.md` | validated-distillate | Yes |
| `ux-design` | workflow | `_context/design/ux-design-spec-v{N}.md` | validated-distillate | Yes |
| `brand-guidelines` | workflow | `_context/design/brand-guidelines-v{N}.md` | validated-distillate | Yes |
| `prototype` | workflow | `_context/design/prototype/{date}/` (manifest + artefacts) | non-distillate | Yes |

`legacy-ui-assessment` moved to `reference/brownfield-pending/` pending the brownfield capability pack (§7.6) — WS5-B, §8 item 6. Not currently gated at Phase 5 (ledger delta D17).

## Recommended flow (default — `standard` archetype)

```
[Phase 4 exit: PRD locked]
        │
        ▼
   design-brief                       ← Step 0 absorbs entry-sync (graph-first context load + bridge-mode confirm + brownfield-UI flag)
        │
        ▼
   ux-design ║ brand-guidelines        ← parallel-OK (both depend on design-brief; not on each other)
        │       │
        └───┬───┘
            ▼
       prototype                        ← reads ux-design + brand-guidelines + tech-stack
            │  (optional: skills/creative/storytelling for narrative/brand-voice work, ad hoc)
            ▼
   reconciliation pass                  ← @ux-designer hands back to @pm; design-deltas → PRD v2
            │
            ▼
   phase-transition (writes phase-5-to-6 handoff)
            │
            ▼
       [Phase 6 entry]
```

### Archetype-mode branching

- `vibe-coder-lean`: design-brief (3-section abbreviated) + ux-design (mock-spec mode) + prototype (visual-mock mode); brand-guidelines tokens-only.
- `standard`: full Phase 5 (default flow above).
- `design-led` / WDS: full + clickable-HTML prototype + brand-guidelines extended (full identity + iconography library).

## Entry conditions

1. PRD locked (Phase 4 `gate.json` `prd-locked == pass`).
2. `personas-v{latest}.md` present (Phase 2 distillate).
3. `tech-stack.md` sacred + locked (Phase 3).
4. `coldpress.yaml baselines:` present + a11y baseline declared.
5. `_context/handoffs/phase-4-to-5-{date}.md` written.

## Exit conditions

See `gate.json` (9 acceptance checks — was 11 before this session (mis-stated as "10"); WS5-B dropped `narrative-emitted` (narrative is no longer a gated deliverable) and `legacy-ui-assessment-emitted` (that skill moved to `reference/brownfield-pending/`, ledger delta D17)). Summary:

- All 4 mandatory distillates emitted + validated.
- Prototype emitted in archetype-conformant mode.
- design-deltas list aggregated (can be empty).
- Reconciliation pass resolved (every delta has user_decision).
- `phase-5-to-6-{date}.md` handoff written including `architecture_adrs_required:` array if any deltas were flagged for ADR.

## Agent

**@ux-designer** owns Phase 5 from entry to reconciliation hand-back. Hand-back to @pm at reconciliation pass for PRD v2 amendment authoring. After phase-transition writes the handoff, @architect receives at Phase 6 entry. Pattern 7 (agent persona transition) is first sustainably invoked here — see `docs/cross-cutting/pattern-7-agent-personas.md`.

No Phase-5-internal sub-personas at v0.3 (no @brand-specialist; no @prototype-engineer). @ux-designer owns full scope — re-evaluate at v0.4+ if real-project feedback shows overload.

## Cross-cutting wire-ins

- **adversarial-review** — wired into `ux-design` step-04-spec finalisation, `prototype` step-04-validate.
- **editorial-prose** — wired into `design-brief` step-04, `brand-guidelines` step-02-voice.
- **editorial-structure** — wired into `design-brief` step-04, `ux-design` step-04-spec, `brand-guidelines` step-04-identity.
- **a11y-audit** (`skills/reviews/a11y-audit/`) — **NEW (Unit #28 / U07)**. Phase 5 design-time invocation: brand-guidelines token contrast verification + UX-spec a11y plan check. Phase 5 contrast failures forward-carry as design-deltas → reconcile back to `brand-guidelines` for re-tokenisation. **Archetype-conditional severity:** design-led / WDS = block; standard = warn; vibe-coder-lean = skip-unless-explicit. Reads `coldpress.yaml` `baselines.a11y` (level: A / AA / AAA; default AA).
- **`data/design/` CSVs** — **NEW (Unit #28 / U08)**. `colors.csv` (20 palettes with WCAG-AA flag + mood); `typography.csv` (12 font pairings with licensing); `styles.csv` (12 visual archetypes with palette pairings); `stacks/{react,nextjs,svelte,vue}.csv` (framework stack recommendations). Consumed by `brand-guidelines` (token authoring), `ux-design` (stack-aware UX patterns), `design-brief` (visual direction).

## Method playbook

See `data/methods/method-defaults.yaml` `phase_5:` section. Tier-1 wired-in methods:

- `design_thinking` (heavy — 5 stages: empathize/define/ideate/prototype/test)
- `brainstorming` (heavy — visual ideation, voice exploration, persona scenarios)
- `advanced_elicitation` (heavy — vague-style triggers)
- `problem_solving` (medium — UX edge cases)
- `story_types` (heavy — narrative work; brand voice samples)

## PRD reconciliation pass

Phase 5's central new mechanism. Every Phase 5 skill emits zero-or-more `design_delta` entries during finalisation (PRD-amendment implications discovered during design). At Phase 5 exit, `phase-transition` aggregates deltas, hands to @pm, prompts user per delta with 4 reconciliation options (`accept_into_prd` / `reject` / `flag_for_architecture_ADR` / `park_for_phase_11`), and authors PRD v(N+1) via lightweight amendment for accepted deltas.

`flag_for_architecture_ADR` carries a silent-divergence risk; mitigation requires Phase 6 to author a corresponding ADR — enforced by Phase 6 entry skill consuming the handoff's `architecture_adrs_required:` array, and by Phase 6 exit gate.

See:
- `schemas/handoffs/design-delta.schema.json` — design-delta shape
- `schemas/sacred-docs/prd-amendment.schema.json` — lightweight amendment payload
- `docs/cross-cutting/phase-reentry-patterns.md` — when re-entry vs reconciliation
- Phase 5 deep-dive [§7](../../docs/lifcyle-phases-deep-dives/phase-5-deep-dive-2026-04-25.md#L370) — full spec

## Source

- Deep-dive: [`docs/lifcyle-phases-deep-dives/phase-5-deep-dive-2026-04-25.md`](../../docs/lifcyle-phases-deep-dives/phase-5-deep-dive-2026-04-25.md) v2.0
- Implementation plan: [`docs/phase-ii-implementation-plan.md` Part 5](../../docs/phase-ii-implementation-plan.md) v1.21

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-07-02 | Butler | WS5-B (§8 item 6) — `legacy-ui-assessment` moved to `reference/brownfield-pending/` pending the brownfield capability pack (§7.6). Sub-skills table, flow diagram, exit conditions (10→9 checks), and cross-cutting wire-ins updated (ledger delta D17). |
| 2.0 | 2026-07-02 | Butler | WS5-B (§8 item 6) — `narrative` deleted; it was a thin wrapper around `skills/creative/storytelling` (its own SKILL.md said so), so narrative/brand-voice work is now ad-hoc use of that cross-cutting skill rather than a gated Phase 5 deliverable. Sub-skills table (6→5), flow diagram, archetype branching, exit conditions (11→10 checks, correcting a pre-existing miscount), and cross-cutting wire-ins updated. |
| 1.0 | 2026-04-30 | Butler (Andy-coldpress-os under autonomous queue unit #3) | Phase 5 README enriched from unit #0 stub. Purpose, sub-skills table (6 skills), recommended flow ASCII diagram with archetype branching, entry/exit conditions, agent ownership, cross-cutting wire-ins table, method playbook reference, PRD reconciliation pass overview, source links. Replaces the brief stub created at unit #0. |
