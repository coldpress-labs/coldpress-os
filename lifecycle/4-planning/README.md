---
phase: 4
name: "Planning"
description: "Product and design planning — briefs, PRD, UX, architecture"
prerequisites:
  - "Phase 3 (Tech Stack) complete"
  - "_context/sacred/tech-stack.md exists"
outputs:
  - "PRD (_context/sacred/prd.md — SACRED)"
  - "architecture.md (_context/sacred/architecture.md — SACRED)"
  - "UX specification (_context/design/ux-design-spec.md)"
next_phase: "5-breakdown"
---

# Phase 4: Planning

> Product and design planning — transform discovery insights and tech stack decisions into concrete plans, specifications, and sacred documents.

## What Happens Here

1. **Product Brief** — Executive summary of the product vision and strategy
2. **Design Brief** — Comprehensive design direction covering content, visual, and platform
3. **Create PRD** — Structured facilitation to produce the Product Requirements Document (sacred)
4. **Validate PRD** — Quality validation of an existing PRD
5. **Create UX Design** — UX patterns, flows, wireframe concepts, and design specification
6. **Create Architecture** — Technical architecture decisions and system design (sacred)
7. **Problem Solving** — Tackle complex product and technical planning challenges
8. **Storytelling** — Craft product narratives and pitch stories

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [product-brief](product-brief/) | workflow | analyst | 1-2 page executive product brief through collaborative discovery |
| [design-brief](design-brief/) | workflow | ux-designer | Comprehensive design brief — content, visual, platform foundation |
| [create-prd](create-prd/) | workflow | pm | Structured PRD creation with create/edit/validate modes |
| [validate-prd](validate-prd/) | simple | pm | Validate existing PRD against quality standards |
| [create-ux-design](create-ux-design/) | workflow | ux-designer | UX patterns, flows, and design specification |
| [create-architecture](create-architecture/) | workflow | architect | Technical architecture decisions and system design |
| [problem-solving](problem-solving/) | router | analyst | -> `skills/creative/problem-solving/` |
| [storytelling](storytelling/) | router | analyst | -> `skills/creative/storytelling/` |
| [templates](templates/) | — | — | Reusable templates for planning artifacts |

## Entry Conditions

- Phase 3 complete (tech stack selected)
- `_context/sacred/tech-stack.md` exists
- Discovery documents available (context.md, research outputs)

## Exit Conditions

- PRD produced and validated (sacred document)
- Architecture document produced (sacred document)
- UX specification produced
- User feels confident about what to build and how

## Recommended Flow

```
product-brief (executive summary of the product)
  |
design-brief (design direction and visual strategy)
  |
create-prd (detailed requirements — SACRED)
  |
validate-prd (quality check)
  |
create-ux-design (UX flows and specification)
  |
create-architecture (technical decisions — SACRED)
  |
-> Phase 5: Breakdown
```

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial Phase 4 definition |
