---
phase: 4
name: "Planning"
description: "PRD authoring and validation — crystallise Phase 2+3 evidence into a sacred product requirements document"
prerequisites:
  - "Phase 3 (Tech Stack) complete"
  - "_context/sacred/tech-stack.md exists"
  - "_context/planning/product-brief-v{N}.md exists (from Phase 2)"
outputs:
  - "PRD (_context/sacred/prd.md — SACRED)"
  - "prd.meta.json (_context/sacred/prd.meta.json — handoff sidecar)"
  - "planning-scope-v{N}.md (_context/planning/ — Phase 4 distillate)"
next_phase: "5-design"
---

# Phase 4: Planning

> PRD authoring — transform Phase 2 discovery evidence and Phase 3 stack decisions into a locked Product Requirements Document. Phase 4 is @pm-owned and PRD-focused. Design (Phase 5) and architecture (Phase 6) follow.

## What Happens Here

1. **Planning Entry Sync** — Warm-handoff from Phase 3: load evidence bundle, detect brownfield, select PRD archetype mode, emit planning-scope distillate
2. **Create PRD** — Evidence-driven PRD authoring: vision → requirements → features → finalize + prd.meta.json sidecar (SACRED)
3. **Validate PRD** — Quality validation + loop-back routing
4. **Legacy Assessment** — (Brownfield only) Evaluate legacy artefacts; categorise keep/refactor/scaffold/reference; emit migration plan
5. **Design Brief** — Design direction document (design-first archetype; or PRD-first users who want a design brief before Phase 5)

> **Note:** `product-brief` is authored in Phase 2 and is an input to Phase 4, not a Phase 4 output. `create-ux-design` is in Phase 5 (Design). `create-architecture` is in Phase 6 (Architecture).

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [planning-entry-sync](planning-entry-sync/) | workflow | pm | Warm-handoff consolidator — load Phase 2+3 bundle, detect mode, emit planning-scope |
| [create-prd](create-prd/) | workflow | pm | Evidence-driven PRD creation; emits prd.meta.json sidecar |
| [validate-prd](validate-prd/) | simple | pm | Validate PRD against quality standards; loop-back routing |
| [legacy-assessment](legacy-assessment/) | workflow | architect | Brownfield: assess legacy artefacts + emit migration plan |
| [design-brief](design-brief/) | workflow | ux-designer | Design direction brief (design-first mode or optional pre-Phase-5) |
| [problem-solving](problem-solving/) | router | — | Cross-cutting creative router — available during Phase 4 → `skills/creative/problem-solving/` |
| [storytelling](storytelling/) | router | — | Cross-cutting creative router — available during Phase 4 → `skills/creative/storytelling/` |
| [templates](templates/) | — | — | Reusable templates for planning artefacts |

## Entry Conditions

- Phase 3 complete (`phase_3_completed: true` in coldpress.yaml)
- `_context/sacred/tech-stack.md` exists and `sacred: true`
- `_context/planning/product-brief-v{N}.md` exists (Phase 2 output)
- Handoff log from Phase 3 transition present

## Exit Conditions

- PRD produced, validated, and sacred-locked (`_context/sacred/prd.md`)
- `prd.meta.json` emitted with feature count, NFR axes, ADR references, baselines active
- Phase 4 gate.json passes (~8 checks)
- `phase_4_completed: true` written to coldpress.yaml

## Recommended Flow

**PRD-first (default):**
```
planning-entry-sync (warm-handoff + scope memo)
  |
create-prd (evidence-crystallisation PRD — SACRED)
  |
validate-prd (quality check + loop-back if gaps found)
  |
-> Phase 5: Design
```

**Design-first (design-led projects):**
```
planning-entry-sync
  |
design-brief (visual + content direction)
  |
create-prd
  |
validate-prd
  |
-> Phase 5: Design
```

**Brownfield addition:**
```
planning-entry-sync (detects legacy artefacts)
  |
legacy-assessment (keep/refactor/scaffold/reference)
  |
create-prd (brownfield_modules_count > 0 in prd.meta.json)
  |
validate-prd
  |
-> Phase 5: Design
```

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.1 | 2026-04-25 | Cadbury-hq | Phase II Part 4 Wave 6 (task 6.3). Fixed `legacy-assessment` agent: pm → architect (Shape A: @pm-primary with conditional @architect dispatch for brownfield only). |
| 2.0 | 2026-04-25 | Cadbury-hq | Phase II Part 4 Wave 1. Full rewrite: Phase 4 scope narrowed to PRD + @pm per Shape A 11-phase restructure. product-brief removed (Phase 2 input). create-ux-design removed (Phase 5). create-architecture removed (Phase 6). planning-entry-sync + legacy-assessment added as new sub-skills. Sub-skill table updated with correct agents/descriptions. problem-solving + storytelling reclassified as cross-cutting creative routers. Recommended flow rewritten: PRD-first default + design-first + brownfield archetype variants. Entry/exit conditions updated. Outputs updated: prd.meta.json sidecar + planning-scope distillate. |
| 1.0 | 2026-04-08 | Alfred | Initial Phase 4 definition |
