---
name: "ux-design"
description: "Phase 5 — convert PRD + design-brief + personas into UX design spec (information architecture, user flows, key screens, interaction patterns, responsive strategy, a11y specifics). Validated-distillate. Persona-grounded."
type: "workflow"
category: "lifecycle"
phase: 5
agent: "ux-designer"
inputs:
  graph_queries:
    - "prd-v{latest}"
    - "design-brief-v{latest}"
    - "personas-v{latest}"
    - "idea-validation-v{latest}"
    - "context-md"
    - "tech-stack-md"
    - "coldpress-yaml-baselines"
    - "planning-scope"
    - "archetype-mode"
  cold_file_reads:
    - "_context/handoffs/phase-4-to-5-{date}.md"
    - "_context/planning/design-brief-v{latest}.md"
  existence_checks:
    - "prd-v{latest}.locked == true"
    - "design-brief-v{latest} exists"
    - "personas-v{latest} exists"
    - "tech-stack-md.locked == true"
    - "baselines.a11y_axis declared"
outputs:
  - artifact: "UX Design Specification"
    location: "_context/design/ux-design-spec-v{N}.md"
    format: "markdown"
    sacred: false
    distillate: true
    schema: "schemas/design/ux-design-spec.schema.json"
  - artifact: "UX Design Specification sidecar"
    location: "_context/design/ux-design-spec-v{N}.meta.json"
    format: "json"
version: "2.0"
---

## Purpose

Phase 5 — author the UX design specification. Information architecture, user flows, key screen concepts, interaction patterns, responsive strategy, and accessibility specifics. Persona-grounded (reads `personas-v{latest}` directly, NOT via PRD's derived persona section). Tech-stack-aware (interaction patterns must be implementable in locked stack).

UX spec is **validated-distillate** (Q4 resolution): regeneratable from PRD + design-brief + personas + baselines, schema-validated, versioned. Not sacred — PRD is the canonical *what*; UX spec is the *projection of how*.

## When to Use

- "create UX design"
- "ux design"
- Phase 5 — invoked after `design-brief` completes (parallel-OK with `brand-guidelines`).

## Prerequisites

- `design-brief-v{latest}.md` exists (Phase 5 prior skill)
- `personas-v{latest}.md` exists (Phase 2 distillate)
- PRD locked + tech-stack locked + a11y baseline declared

## Process

5-step guided workflow. Step 0 is graph-first context load.

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/design/ux-design-spec-v{N}.md` — comprehensive UX design specification covering:
1. Design overview (principles + persona summary)
2. Information architecture (site map, navigation)
3. User flows (persona-grounded; one flow per primary user task)
4. Key screens (concept-level, with content rationale + interaction notes)
5. Interaction patterns (gestures, transitions, feedback)
6. Responsive strategy (breakpoints + content reflow)
7. Accessibility (WCAG-AA default; AAA opt-in surfaces upgraded thresholds)
8. Tokens reference (points to `brand-guidelines-v{N}.md` § Tokens)

Validated-distillate. Schema-validated. Sidecar emitted with input source versions.

## Design-deltas

UX flows may surface PRD gaps: ambiguous user stories, missing acceptance criteria, unspoken NFRs (motion-reduce, offline). Surfaced as `design_delta` entries appended to `_context/handoffs/phase-5-design-deltas-wip-{date}.md`. Aggregated by `phase-transition` at Phase 5 exit.

## Cross-cutting wire-ins

- `adversarial-review` — Step 4 finalisation (challenge UX assumptions; offer before lock)
- `editorial` — Step 4 finalisation (spec structure check)
- `advanced-elicitation` — Step 3 wireframes (vague_interaction_pattern triggers)
- `problem-solving` — Step 3 wireframes (edge_case_hunter for UX edge cases)

## Method playbook

`design_thinking` ideate stage (heavy — Step 3); `problem_solving` (medium — Step 3 edge cases); `advanced_elicitation` (heavy — Step 3 vague triggers).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-30 | Butler (autonomous queue unit #3 Wave 5.3) | Phase 5 rewrite + rename. Skill renamed `create-ux-design` → `ux-design` (drops `create-` verb prefix; consistency with `intake`, `personas`, `prototype` per decisions log #14). Inputs block converted to graph-first structure (graph_queries + cold_file_reads + existence_checks per deep-dive §7b.2). Inputs expanded to include personas-v{latest} directly (NOT via PRD-derived section — fixes B5), idea-validation, tech-stack, baselines, planning-scope, archetype-mode (fixes B5, B6). Outputs upgraded to validated-distillate with sacred=false confirmed (Q4 resolution); schema referenced. Step 0 (NEW) added — graph-first context load. Cross-cutting review wire-ins documented. Phase tag bumped 4→5 (done in Wave 5.1). Folder relocated `lifecycle/4-planning/create-ux-design/` → `lifecycle/5-design/ux-design/` (Wave 5.1 prerequisite move). |
| 1.0 | 2026-04-08 | Alfred | Initial create-ux-design skill definition |
