---
phase: 6
name: Architecture
agent: architect
status: scaffolded — Phase 6 implementation in progress (autonomous queue unit #6, 2026-04-30)
---

# Phase 6 — Architecture

> **NEW phase under Shape A (2026-04-24).** Pre-Shape-A, architecture was authored inside Phase 4 Planning by `create-architecture` skill (under @architect dispatch from @pm-orchestrated flow). Shape A extracts architecture into its own phase, owned by @architect, with explicit entry conditions guaranteeing PRD + UX spec + brand-guidelines + tech-stack are all simultaneously available.

## Purpose

Phase 6 is the **first integration moment**. PRD says *what*, UX says *how-it-feels*, brand-guidelines says *visual-language*, tech-stack says *with-what*. Architecture says *how-the-pieces-connect*. Phase 6 unifies these specs into a single technical shape: component layout, data flow, integration boundaries, NFR implementation strategy, supporting ADRs.

**Phase 6 is technical-shape formalisation atop a complete product-shape spec.**

## Sub-skills

| Skill | Type | Output | Tier | Required? |
|-------|------|--------|------|-----------|
| `architecture-design` | workflow | `_context/sacred/architecture.md` + `architecture.meta.json` + N ADRs | sacred + sidecar + distillates | Yes |
| `diagram-creator` | workflow | Mermaid (system-context / component / sequence / ER) + PlantUML (deployment / complex-sequences) at `_context/design/diagrams/v{N}/` + diagram index | distillate (regeneratable) | Yes — runs at Phase 6 exit |

ADR authoring is a sub-flow inside `architecture-design` Step 5 (per Phase 6 deep-dive Q4 — not a separate skill).

`diagram-creator` was added in Unit #28 (U06; mhattingpete/claude-skills-marketplace Apache-2.0 pattern). Runs after `architecture-design` locks; reads `ArchitectureComponent` graph nodes + `architecture.md` + ADRs; emits both Mermaid (markdown-embedded for README + Claude Code inline) and PlantUML (richer notation for deployment topology + complex sequences). Architecture.md gets a `## Diagrams` section appended cross-referencing each emitted diagram.

## Recommended flow

```
[Phase 5 exit: UX spec validated, brand-guidelines validated, prototype emitted, design-deltas reconciled]
        │
        ▼
   architecture-design
     ├── Step 0: Graph-first context load + staleness check + existence_checks
     ├── Step 1: Flagged-deltas-intake (consume `architecture_adrs_required[]` from phase-5-to-6 handoff)
     ├── Step 2: System overview + component identification
     ├── Step 3: Data flow + integration boundaries (with tech-stack imports verification)
     ├── Step 4: NFR implementation strategy (a11y / perf / SEO / observability — baseline-driven)
     ├── Step 5: ADR authoring — organic ADRs PLUS REQUIRED ADRs for flagged deltas
     ├── Step 6: Architecture.md emit + sidecar + adversarial-review + editorial-structure + editorial-prose
        │
        ▼
   phase-transition (writes phase-6-to-7 handoff)
        │
        ▼
   [Phase 7 entry — @pm Breakdown]
```

## Entry conditions

1. Phase 5 gate passed (PRD locked, UX-spec validated, brand-guidelines validated, prototype emitted, prd-reconciliation-resolved, phase-5-handoff-written).
2. `_context/sacred/prd.md` exists (possibly v(N+1) post-Phase-5-reconciliation).
3. `_context/design/ux-design-spec-v{latest}.md` validated.
4. `_context/design/brand-guidelines-v{latest}.md` validated.
5. `_context/sacred/tech-stack.md` locked.
6. `_context/handoffs/phase-5-to-6-{date}.md` exists (with `architecture_adrs_required:` array, possibly empty).

## Exit conditions

See `gate.json` (8 acceptance checks). Summary:

- `prd-locked` re-verified at exit.
- `architecture-md-authored` (sacred document with valid frontmatter; schema-validates).
- `architecture-meta-sidecar` exists and validates.
- `adrs-authored` (≥1 ADR; usually multiple).
- **`architecture-adrs-for-flagged-deltas-emitted`** — silent-divergence guard (block-severity). Every Phase 5 flagged delta has a corresponding ADR with `resolves_design_delta` field.
- `tech-stack-imports-verified` — every external dependency referenced in architecture.md is in `tech-stack.md.dependencies` OR has a Phase 3 ADR amendment.
- `nfr-axes-addressed` (warn) — every NFR axis from PRD has architectural implementation strategy.
- `phase-6-handoff-written` — `phase-6-to-7-{date}.md` exists with valid extended phase-handoff schema.

## Silent-divergence guard

Phase 5 introduced the `flag_for_architecture_ADR` reconciliation option for design-deltas. Phase 6 enforces the corresponding ADR creation. Without enforcement, design could diverge from PRD silently. Phase 6 exit gate check #5 (block-severity) makes the divergence auditable.

Phase 6 entry skill MUST consume `phase-5-to-6 handoff.architecture_adrs_required[]` and queue corresponding ADRs (Step 1: flagged-deltas-intake). Phase 6 cannot exit until every flagged delta has its matching ADR. The mitigation converts silent divergence into auditable architectural-decision provenance.

## Agent

**@architect** owns Phase 6 entry-to-exit. Pattern 7 transitions:
- #5: phase_entry — phase-transition → @architect (warm_handoff: `phase-5-to-6-{date}.md`)
- #6: phase_exit — @architect → phase-transition
- #7: phase_entry (Phase 7) — phase-transition → @pm (warm_handoff: `phase-6-to-7-{date}.md`)

No Phase-6-internal sub-personas at v0.3 (single-agent phase per Phase 6 §10b).

## Cross-cutting wire-ins

- `adversarial-review` — `architecture-design` Step 6 finalisation (challenge architectural assumptions; pre-mortem on integration boundaries)
- `editorial-structure` — Step 6 finalisation (architecture.md structure check)
- `editorial-prose` — Step 5 ADR rationale prose polish

## Architecture amendment workflow

Hybrid model (Phase 6 deep-dive Q5):

- **Significant structural changes** (e.g., adding a component family, replacing a database) → re-emit `architecture.md` with VC major bump
- **Incremental decisions** → new ADR + architecture.md ADR-Index update + VC minor bump

Both routes use the existing per-sacred-doc amendment workflow at [`governance/architecture-change/`](../../governance/architecture-change/) (per Q6 reuse decision — same pattern as Phase 3's `governance/tech-stack-change/` amendments; `governance/sacred-docs.md` documents the broader sacred-doc governance).

## Method playbook

See `data/methods/method-defaults.yaml` `phase_6:` section. Tier-1 wired-in methods:

- `problem_solving` (heavy — first_principles, failure_mode_analysis, scenario_planning at Steps 3+4+5)
- `advanced_elicitation` (heavy — vague_architectural_pattern / vague_nfr_strategy / vague_integration_boundary triggers)
- `design_thinking` (medium — define + ideate stages at Steps 2+3)
- `brainstorming` (medium — round_robin, what_if_mashup, six_thinking_hats at Steps 2+3+4)
- `story_types` (low — feature_story for ADR rationale narratives only)

## Source

- Deep-dive: [`docs/lifcyle-phases-deep-dives/phase-6-deep-dive-2026-04-30.md`](../../docs/lifcyle-phases-deep-dives/phase-6-deep-dive-2026-04-30.md) v1.0
- Implementation plan: [`docs/phase-ii-implementation-plan.md` Part 6](../../docs/phase-ii-implementation-plan.md) v1.22

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-30 | Butler (Andy-coldpress-os under autonomous queue unit #6 Wave 6.1) | Phase 6 README enriched from unit #0 stub. Purpose, sub-skill table, recommended flow ASCII, entry/exit conditions, silent-divergence guard explainer, Pattern 7 transitions, cross-cutting wire-ins, hybrid amendment workflow, method playbook reference, source links. |
