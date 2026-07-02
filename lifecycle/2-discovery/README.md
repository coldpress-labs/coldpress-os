---
phase: 2
name: "Discovery"
description: "Research, context gathering, and problem understanding before planning"
prerequisites:
  - "Phase 1 (Bootstrap) complete"
  - "coldpress.yaml configured"
outputs:
  - "_context/sacred/context.md (SACRED)"
  - "Research documents in _context/planning/research/"
  - "_context/planning/research-synthesis-v{N}.md"
  - "_context/planning/product-brief-v{N}.md (validated distillate)"
next_phase: "3-tech-stack"
---

# Phase 2: Discovery

> Understand the problem space, users, market, and domain before making any technical or product decisions. Phase 2 is the last cheap-pivot window before Phase 3 commits to a stack.

## What Happens Here

`context.md` arrives already `status: authored` — Phase 1 `intake` owns that transition now (WS5-B, §8 item 6). Phase 2 starts directly with research:

1. **Research** — Domain, market, or constraint research, parameterized by `focus` + `depth` (one skill covers all three — they shared near-identical step scaffolds)
2. **Personas** — User archetypes, journey maps, accessibility/device/locale targets (`@ux-designer`)
3. **Validate-Idea** — Last cheap-pivot window: problem / riskiest assumption / differentiation / fit / metrics / prior art + conditional stakeholder/client alignment + red-flag escape hatch (warn-severity; solo may skip)
4. **Product Brief** — Step 1 consolidates all research + validation into a versioned synthesis artefact; Steps 2-5 distil it into the validated-distillate executive brief
5. **Brainstorming / Design Thinking / Problem-Solving / Innovation Strategy** — Creative methods (available on demand via routers)

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [research](research/) | workflow | analyst | Domain, market, or constraint research — `focus: domain\|market\|constraints` + `depth: standard\|deep`. Run 1-3 times per project (once per focus needed). Merges the former `domain-research`/`market-research`/`constraint-research` |
| [personas](personas/) | workflow | ux-designer | User archetypes + journey maps + accessibility/device/locale targets. Tier 1 methods: User Interviews, Empathy Mapping, JTBD, Journey Mapping, Diary Studies, Affinity Clustering |
| [validate-idea](validate-idea/) | workflow | analyst | Last cheap-pivot window before Phase 3 — 6 core + 2 conditional + Step 9 red-flag escape hatch. Tier 1: Problem Refinement, Five Whys, Is/Is Not, Lean Startup, Risk Matrix, Blue Ocean, Positioning Map, VPC, JTBD, Gap Analysis, Measurement Framework, Disruptive Innovation, Crossing the Chasm. Warn-severity — solo may skip |
| [product-brief](product-brief/) | workflow | analyst | Step 1 consolidates research + validation into a versioned synthesis artefact (Tier 1: Systems Thinking, Morphological Analysis; wires distillator, adversarial-review, editorial-structure); Steps 2-5 distil it into a validated-distillate executive brief (versioned, regeneratable — not sacred) |
| [brainstorming](brainstorming/) | router | analyst | → `skills/creative/brainstorming/` |
| [design-thinking](design-thinking/) | router | analyst | → `skills/creative/design-thinking/` |
| [problem-solving](problem-solving/) | router | analyst | → `skills/creative/problem-solving/` (30 frameworks; several Tier 1 wire-ins for validate-idea) |
| [innovation-strategy](innovation-strategy/) | router | analyst | → `skills/creative/innovation-strategy/` (30 frameworks — Blue Ocean, JTBD, Crossing the Chasm; Tier 1 wire-ins for validate-idea) |

## Subagents

- **`@analyst`** — primary for research + synthesis + validation skills
- **`@ux-designer`** — primary for `personas` (and downstream Phase 4 `create-ux-design`)

## Entry Conditions

- Phase 1 complete (project initialized; `context.md` already `status: authored` + sacred-signed-off + `_input/` populated — Phase 1 `intake` now owns full context.md authoring, WS5-B)
- User is ready to define the project scope

## Exit Conditions

Phase 2 exit is gated by `lifecycle/2-discovery/gate.json` (4 checks, 2 block + 2 warn — the context-authoring checks moved to the Phase 1 gate, WS5-B):

**Block (must pass before Phase 3):**
- `_context/planning/research-synthesis-v1.md` (or higher) exists
- `_context/planning/product-brief-v1.md` (or higher) exists with `status: authored`

**Warn (surfaced but not blocking):**
- `_context/planning/idea-validation-v1.md` exists (skip only for solo vibe-coder with well-understood scope)
- Supersession log exists if any `_input/` conflicts were detected during Phase 2

## Recommended Flow

```
Phase 1 intake hands off with context.md already authored + sacred-signed-off
  ↓
research (focus: domain) + research (focus: market) + research (focus: constraints) + personas (parallel, as needed)
  ↓
validate-idea (warn-severity — solo vibe-coder may skip; team + client must run)
  ↓
product-brief (last — Step 1 consolidates research + validation into a versioned synthesis, Steps 2-5 distil the executive brief)
  ↓
brainstorming / design-thinking / problem-solving / innovation-strategy (optional, on demand)
  ↓
→ Phase 3: Tech Stack (via phase-transition skill — Wave 4.5)
```

### Phase 2 scales with project

| Scenario | Skills run |
|---|---|
| Solo vibe-coder (prototype) | 1 `research` pass → brief (2 workflow skills) |
| Solo builder (structured) | 2-3 `research` passes → validate → brief (4-5) |
| Team project | `research` (all 3 foci) + `personas` + `validate-idea` + `product-brief` + validate-idea Step 7 (stakeholder alignment) |
| Client project | same as team + Steps 7 + 8 + party-mode opt-in + client-signoff |

## Available On Demand

The 4 creative routers can be invoked at any point during Phase 2:

| Router | Purpose |
|---|---|
| `brainstorming` | Open-ended idea generation — Blue Sky, SCAMPER, Random Word, etc. |
| `design-thinking` | Human-centred research: empathy, define, ideate (before solution framing) |
| `problem-solving` | 30 diagnostic frameworks — Five Whys, Fishbone, Root Cause, etc. |
| `innovation-strategy` | Strategic opportunity lenses — Blue Ocean, Disruptive Innovation, etc. |

**`party-mode`** (opt-in): for complex projects, invoke during `product-brief` Step 1 for multi-agent cross-critique. All 8 subagents weigh in. Heavy — use when synthesis quality matters more than speed.

## Architectural Note — Supersede-check vs Sacred-doc Change-workflow

These two mechanisms apply at different times and compose without conflicting:

- **Supersede-check** fires *during Phase 1 `intake` authoring* (Steps 8-10, before the Step 11 sacred signoff) when user answers contradict material in `_input/`. The helper (`src/governance/supersede.ts`) records the decision as a `superseded_by` graph edge + audit log row in `_context/audit/supersessions-{date}.md`.
- **Sacred-doc change-workflow** fires *after signoff* for any amendment to `context.md`. Future edits route through the `sacred-change` skill (enforced by the `sacred-guard` hook), not through re-running Phase 1 or Phase 2.
- The two compose: a Phase 4 create-architecture decision that overrides a `context.md` claim would invoke `sacred-change` AND potentially fire a supersede-check for the `_input/` artifact the context.md originally referenced.

See `docs/supersessions-log-spec.md` for the audit log format.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 5.0 | 2026-07-02 | Butler | WS5-B (§5 P2, §8 item 6) — `domain-research`/`market-research`/`constraint-research` merged into one `research` skill (`focus: domain\|market\|constraints` + `depth: standard\|deep`). "What Happens Here", Sub-Skills table, Recommended Flow, and scaling table updated. |
| 4.0 | 2026-07-02 | Butler | WS5-B (§8 item 6) — `synthesize-research` merged into `product-brief` as its Step 1. Sub-Skills table drops the synthesize-research row (7→6 workflow skills); "What Happens Here", Recommended Flow, and the scaling table updated to match; `research-synthesis-exists` gate check remediation updated. |
| 3.0 | 2026-07-02 | Butler | WS5-B (§8 item 6) — `pre-project-interview` merged into Phase 1 `intake`; `context.md` now arrives already `authored` + signed-off. "What Happens Here" and Sub-Skills table drop the interview row; Entry/Exit Conditions and Recommended Flow updated (gate.json check count corrected 7→4 — the README had drifted from the actual 6-check gate.json even before this change, and never had a real graph-staleness check). Subagent roster count 9→8 (WS4 roster surgery). Dead `governance/change-workflows/context.md` reference replaced with `sacred-change` (WS1-G). |
| 2.0 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 5 (complete). Exit conditions rewritten to mirror gate.json structure (4 block + 3 warn checks named explicitly). Forward-looking note removed — Waves 3+4 now landed. "Available On Demand" subsection added for 4 creative routers + party-mode opt-in. "Architectural Note — Supersede-check vs Sacred-doc Change-workflow" subsection added (FP16): clarifies pre-signoff vs post-signoff boundary, notes the two mechanisms compose rather than compete. |
| 1.3 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 2 (complete). Sub-skills table now lists all 8 workflow skills (`validate-idea` + `synthesize-research` added alongside `personas` from v1.2). "What Happens Here" expanded to 9-item list including the two new skills. Recommended flow updated: interview → parallel research → validate-idea → synthesize-research → product-brief (handoff to Phase 3 via `phase-transition` skill, Wave 4.5). New "Phase 2 scales with project" subsection (FP20) — minimum-viable path by `team_shape` + `cadence`. Forward-looking note narrowed to Wave 3-5 wire-ins. |
| 1.2 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 2 (partial). Sub-skills table grew: added `personas` (workflow, `@ux-designer`) + `problem-solving` + `innovation-strategy` (two new creative routers matching brainstorming / design-thinking pattern). `product-brief` row updated for validated-distillate tier. New "Subagents" section clarifies `@analyst` primary + `@ux-designer` for personas. Recommended flow updated — personas runs in the parallel research lane; product-brief runs last. Forward-looking note narrowed to remaining Wave 2 work (`synthesize-research`, `validate-idea`) plus Wave 3-5 wire-ins. |
| 1.1 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 1.4 — "Technical Research" renamed to "Constraint Research" (flow + sub-skills table + descriptions). Exit conditions updated: "domain, market, or technical" → "domain, market, or constraint." Pre-Project Interview purpose rephrased for the warm-handoff era (fleshes the seed, not authors from scratch). Added forward-looking note on Waves 2-5 additions (personas / validate-idea / synthesize-research / distillate product-brief). |
| 1.0 | 2026-04-08 | Alfred | Initial Phase 2 definition |
