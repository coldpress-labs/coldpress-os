---
phase: 3
name: "Tech Stack"
description: "Convert Phase 2 validated evidence into a locked technology stack and a running dev environment"
prerequisites:
  - "Phase 2 (Discovery) complete"
  - "_context/sacred/context.md produced and validated"
  - "_context/planning/product-brief-v{N}.md authored"
  - "_context/planning/idea-validation-v{N}.md authored"
  - "Phase 2 handoff log present at _context/handoffs/phase-2-to-3-*.md"
outputs:
  - "_context/sacred/tech-stack.md (SACRED)"
  - "ADRs in _context/planning/adrs/adr-{decision}-v{N}.md"
  - "_context/planning/stack-shortlist-v{N}.md"
  - "_context/planning/stack-selection-summary-v{N}.md"
  - "coldpress.yaml stack_pack field written"
  - "coldpress.yaml baselines: block written"
  - "Configured development environment"
next_phase: "4-planning"
---

# Phase 3: Tech Stack

> Phase 3 Tech Stack converts Phase 2's validated evidence and constraint envelope into a locked technology stack and a running dev environment.

## Purpose

Phase 3 is **evidence-driven, not free-form catalog browse.** Stack evaluation reads authored `context.md`, personas (with accessibility / device / language targets), constraint-research (compliance / performance envelopes), `idea-validation-v{N}` (riskiest assumptions + North Star), `product-brief` (users + value prop), `_input/vendor/` (pre-loaded SDK docs), `_input/legacy/` (brownfield carry-over), and `.coldpress/local-config.yaml` (team_shape, project_shape, cadence). Candidates are shortlisted *from* this evidence — not named ad-hoc. Evaluation weighs each candidate against a 6-dimension rubric (fit, cost, team-familiarity, ecosystem-maturity, lock-in, vibe-fit).

**Phase 3 is the commit-point.** Stack-locking emits `tech-stack.md` (sacred) + `stack-selection-summary-v{N}.md` (validated distillate). A "last cheap pivot before lock" escape-hatch mirrors `validate-idea` Step 9 — after lock, pivoting is expensive. Stack-locking writes `stack_pack` + `baselines:` back to `coldpress.yaml` and triggers the Phase 3 exit hook: `coldpress update --post-phase-3` regenerates stack-specific wrappers. Env-provision then branches on stack-pack presence: if a pack exists, its `quickstart` skill handles setup; otherwise a generic runtime-install path runs.

**Phase 3 is the second production use of the supersede pattern.** Stack decisions that override `_input/` assumptions emit `supersedes:` frontmatter + audit log. `_input/` files are never deleted; the audit trail stays honest.

**Butler as @architect.** During Phase 3, Butler's prose voice is architect-led — communicating in the architect's domain language (trade-offs, rubric dimensions, constraint reasoning). This is the same facade pattern as Phase 2 analyst-lead: Butler's identity and role are unchanged; the @architect subagent handles deep evaluation work. Users do not need to switch identities — Butler surfaces and translates architect outputs.

## What's New vs Cold-Start Era

| Cold-start (pre-Phase-2-redesign) | Now (warm-handoff era) |
|---|---|
| Phase 3 entry: blank — "what do you want to build?" | Phase 3 entry: rich evidence packet (personas, constraints, product-brief, idea-validation, graph) |
| Candidates named ad-hoc by user or Butler suggestion | Candidates derived from evidence + archetype-matched pack library |
| Single evaluation pass, no tiers | Three-tier path: T1 pack fast-path / T2 pre-loaded catalog / T3 independent |
| No escape hatch before lock | Red-flag escape hatch (Step 3a) mirrors validate-idea Step 9 |
| Stack written manually, no schema | Sacred tech-stack.md + schema-validated ADRs + stack-selection-summary distillate |
| No cross-cutting quality baseline | 4 default-on baselines (seo_aeo_llm, accessibility, security, future_proof) confirmed at lock |
| env-provision generic only | Pack-branched: quickstart handles pack archetypes; generic path for independent stacks |

## Warm-Handoff Inputs from Phase 2

All Phase 3 skills read these as evidence. `stack-discovery-sync` consolidates them on entry; downstream skills do not re-ask questions Phase 2 already answered.

| Artefact | Location | Role in Phase 3 |
|----------|----------|-----------------|
| context.md (sacred) | `_context/sacred/context.md` | Project intent, team-shape, project-shape |
| product-brief | `_context/planning/product-brief-v{N}.md` | Value prop, user targets, constraints envelope |
| idea-validation | `_context/planning/idea-validation-v{N}.md` | Riskiest assumptions, North Star |
| personas | `_context/planning/research/personas-*.md` | Accessibility, device, language targets |
| constraint-research | `_context/planning/research/constraint-*.md` | Compliance, performance, budget envelopes |
| research-synthesis | `_context/planning/research-synthesis-v{N}.md` | Synthesised evidence package |
| handoff log | `_context/handoffs/phase-2-to-3-*.md` | Official entry signal |

## What Happens Here

1. **Stack Discovery Sync** — Consolidate Phase 2 evidence, classify project type + domain complexity, match against available starter packs (archetype-fit scoring), derive tiered candidates per decision-area (T1 pack pre-pick / T2 catalog / T3 independent)
2. **Stack Evaluation** — Evaluate candidates per decision-area using a 6-dimension rubric; produce versioned, schema-validated ADRs for each decision
3. **Stack Locking** — Inventory ADRs, apply product-type-aware category check, run red-flag escape hatch, confirm cross-cutting baselines, produce sacred `tech-stack.md` + distillate summary, write `stack_pack` + `baselines:` to `coldpress.yaml`
4. **Env Provision** — Install dependencies, configure tooling and baselines, verify the dev environment works; dispatches to pack quickstart if `stack_pack` non-empty

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [stack-discovery-sync](stack-discovery-sync/) | workflow | architect | Consolidate Phase 2 evidence → archetype classification → pack-match → tiered shortlist |
| [stack-evaluation](stack-evaluation/) | workflow | architect | 6-dim rubric evaluation → versioned ADRs (T1 fast-path or T2/T3 full rubric per area) |
| [stack-locking](stack-locking/) | workflow | architect | ADR inventory + escape hatch + baselines confirm → sacred tech-stack.md |
| [env-provision](env-provision/) | workflow | developer | Pack-branching provision + baselines activation |

## Decision-Area Priority Heuristics

`stack-discovery-sync` Step 3 uses these signals to determine which decision-areas to foreground, and in what order. These are not hard rules — Butler applies them as defaults and the user can override.

| Signal | Effect on decision-area priority |
|--------|----------------------------------|
| `user.cadence: silent` | Lean: 3–4 core decisions only (frontend, backend, database, hosting) |
| `user.cadence: summary` | Default: 5–7 core + recommended decisions |
| `user.cadence: verbose` | Comprehensive: all product-type-required + recommended areas |
| `project_shape: brownfield` | Skip decisions locked by legacy; flag contested areas for explicit supersede |
| `personas.accessibility_targets != default` | Elevate frontend framework decision to high-priority |
| `constraint-research.compliance != none` | Elevate backend + hosting + database to high-priority; bias away from lock-in SaaS in regulated domains |
| `idea-validation.riskiest_assumptions` mentions specific tech | Elevate that decision-area |
| `_input/vendor/` has SDK docs for X | Weight X candidate heavily in the relevant area |
| Product-type = CLI / library | Skip frontend / hosting / auth areas |
| Product-type = mobile-only | Swap web-frontend for mobile-frontend; add app-store / review-process decisions |
| Product-type = ML / data-pipeline | Add orchestration + model-serving decision-areas |

## Entry Conditions

- Phase 2 complete (`phase_2_completed: true` in `.coldpress/local-config.yaml`)
- `_context/sacred/context.md` exists and is locked (sacred)
- `_context/planning/product-brief-v{N}.md` authored
- `_context/handoffs/phase-2-to-3-*.md` present

## Exit Conditions (Phase Gate)

Phase 3 uses a two-stage gate (`evaluate-phase-gate`):

**Stage 1 — stack-locked, pre-provision:**
- All major technology decisions documented as schema-valid ADRs under `_context/planning/adrs/`
- `_context/sacred/tech-stack.md` produced, schema-valid, and marked sacred
- `_context/planning/stack-selection-summary-v{N}.md` exists + schema-valid
- `coldpress.yaml stack_pack` field set (empty string `""` = no pack, generic path)
- `coldpress.yaml baselines:` block written + schema-valid

**Stage 2 — post-provision:**
- Dev environment configured and verified (build, lint, test all pass)
- `coldpress update --post-phase-3` run; local-config `post_phase_3_update_ran: true`
- Graph freshness confirmed

## Recommended Flow

```
stack-discovery-sync (consolidate evidence + classify + pack-match + derive candidates)
  ↓
stack-evaluation (repeat for each decision-area; T1/T2/T3 tiered path per area)
  ↓
stack-locking (inventory + review + escape hatch + baselines confirm → sacred tech-stack.md)
  ↓
[user runs: coldpress update --post-phase-3]
  ↓
env-provision (pack-quickstart branch OR generic install + baselines activation)
  ↓
→ Phase 4: Planning
```

## Phase 3 Scales With Project

| Scenario | Typical path | Skills run | Approx. wall-time |
|---|---|---|---|
| Solo vibe-coder — pack match | Steps 1→2 (pack accept)→3 (lean)→4×2–3 (T1 fast-path)→5→5a (all y)→6→7 (pack quickstart)→8 | 4–5 sub-skill runs | 10–15 min |
| Solo builder — pack match with 1–2 overrides | Full path, mix T1 fast-path + T2 rubric for overrides | 6–8 sub-skill runs | 25–40 min |
| Solo builder — independent evaluation | Full path, all T2/T3 rubric, optional escape hatch | 7–10 sub-skill runs | 45–75 min |
| Team project | Solo + stakeholder alignment + per-baseline team-visible rationale | Full + governance/stakeholder | 60–90 min |
| Client project | Team + client signoff + party-mode at 3a and review + client-readable summary | Full + 1–2 party-mode invocations | 1.5–3 hours |
| Re-entry (post-lock amendment) | Step 0 branch 4 menu → targeted skill (amend baselines OR revise ADR OR re-provision) | 1 targeted sub-skill | 5–15 min |

## Pre-Phase-3 / Post-Phase-3 CLI

The `coldpress update --post-phase-3` command runs manually between stack-lock and env-provision. It regenerates stack-specific skill wrappers based on the `stack_pack` value written at lock time, and sets `post_phase_3_update_ran: true` in local-config.

**Failure modes:**
- **Missing stack tools** — Pack quickstart will fail if required CLIs (e.g., `wrangler`, `wxt`) are absent. Butler surfaces the missing tool list before env-provision starts.
- **Hook error** — If the hook itself errors (npm script failure, permission), Butler shows the error and offers a retry. The `post_phase_3_update_ran` flag is not written until the hook succeeds.
- **Never run** — If env-provision is attempted with `post_phase_3_update_ran: false`, Butler blocks and prompts: "Run `coldpress update --post-phase-3` first." Re-prompts after 1h (gentle) and 24h (firm) if still not run.

## Commit-Point Messaging

Phase 3 surfaces the commit-point framing at exactly **three moments**:
1. **Step 1 (stack-discovery-sync entry)** — "Phase 3 is the build commit-point — after lock, stack changes are expensive. Phase 2 gave you the last cheap pivot for the idea; Phase 3 gives you the last cheap pivot for the build."
2. **Step 3a (red-flag escape hatch)** — "One or more red flags emerged. This is the last cheap moment to pause before locking. Options: proceed / revise / party-mode for external pressure-test."
3. **Step 5a (baselines confirmation)** — "After this confirmation, the baselines choices are written to `coldpress.yaml` and cost real setup effort to reverse."

This is deliberate calibration — not repetition. More surfacings would be patronising; fewer would let users walk past the commit boundary unaware.

## Rubric-Walk Resume Behaviour

When resuming a Phase 3 session mid-stack-evaluation, the rubric walk for the interrupted decision-area **restarts**. Rubric data (answers, weighted scores) is not persisted to disk — only the final ADR file is. Completed-area ADRs are final and will not be re-evaluated. This is expected behaviour: if Butler asks the same rubric questions for one decision-area, it means that area was interrupted before its ADR was written. Once an ADR exists in `_context/planning/adrs/`, that area is considered locked.

## Available on Demand

| Skill | When |
|-------|------|
| `brainstorming` | Stack-pattern ideation on novel areas (e.g., "how should we approach offline sync?") |
| `innovation-strategy` | Stack-shaping questions (Jamstack vs monolith, edge-first, serverless) |
| `party-mode` | Pressure-test the composite stack with all agents before lock — auto-offered at Step 3a critical risk or when `team_shape = client-project` |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-24 | Cadbury-hq | Wave 5 §5.1. Full v2.0 polish: decision-area heuristics table (FP2); "What's new vs cold-start era" comparison table; "Phase 3 scales with project" table (6 scenarios × path × wall-time); Pre/Post-Phase-3 CLI note with failure modes; commit-point messaging calibration (3 deliberate surfacings); rubric-walk restart note (R4-7); Butler-as-@architect facade clarifier (R3-9); outputs frontmatter updated to include baselines block. |
| 1.1 | 2026-04-24 | Cadbury-hq | Wave 1 §1.4 draft: purpose rewrite (evidence-driven commit-point framing); warm-handoff inputs table; 4-skill sub-skill list; two-stage gate outline; available-on-demand section. VC bump to v2.0 deferred to Wave 5 final polish per plan. ADR path updated to adrs/ subdir. "Vibe Coder Setup" renamed to "Env Provision". |
| 1.0 | 2026-04-08 | Alfred | Initial Phase 3 definition |
