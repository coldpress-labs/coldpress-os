---
name: "research"
description: "Phase 2 — domain, market, or constraint research using web sources, parameterized by focus and depth. Merges the former domain-research/market-research/constraint-research skills, which shared near-identical step scaffolds"
type: "workflow"
category: "lifecycle"
phase: 2
agent: "analyst"
inputs:
  - "coldpress.yaml"
  - "_context/sacred/context.md"
  - "_context/tracking/intake-{date}.md"
  - ".coldpress/local-config.yaml (for project_shape)"
  - "_input/reference/ and _input/vendor/ (pre-loaded material — checked before web search)"
outputs:
  - artifact: "Research report (domain) or Market research report (market) or Constraint envelope (constraints)"
    location: "_context/planning/research/{focus}-{topic}-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Conducts domain, market, or constraint research using web search, parameterized by:

- **`focus`** — `domain` | `market` | `constraints`. Selects which of the three research shapes runs; each has a distinct output structure (see below). Run once per focus needed — a project typically runs 1-3 research passes in the Phase 2 parallel research lane.
- **`depth`** — `standard` | `deep`. `standard` covers the primary axes at moderate thoroughness; `deep` exhausts secondary sources, cross-checks conflicting claims, and widens the source count. Ask the user, or default to `standard` for solo vibe-coder projects and `deep` for client/team projects (per `user.team_shape`).

Merges the former `domain-research`, `market-research`, and `constraint-research` skills (WS5-B, §8 item 6) — an audit found their step scaffolds near-identical (scope → research → synthesize → report), differing only in what's researched and how findings are structured. One skill, one `focus` parameter, instead of three near-duplicate skill directories.

## When to Use

- "research the domain" / "domain research for {industry}" → `focus: domain`
- "market research" / "competitive analysis" / "who else does this?" → `focus: market`
- "constraint research" / "compliance requirements" / "performance / accessibility / regulatory constraints" → `focus: constraints`
- Any time in the Phase 2 parallel research lane, alongside `personas`

## Prerequisites

- `_context/sacred/context.md` exists (`status: authored` — Phase 1 `intake` ran)
- Web search capability required (recommended for `constraints`, since regulatory/standards citations matter most there)

## Process

4-step guided workflow, each step branching on `focus`. → See [workflow.md](workflow.md) for the full process.

## Output shapes by focus

- **`domain`** → `_context/planning/research/domain-{topic}-{date}.md`: Executive Summary, Industry Overview, Key Findings, Implications for Project, Terminology, Sources.
- **`market`** → `_context/planning/research/market-{topic}-{date}.md`: Executive Summary, Competitive Landscape, Market Sizing, Customer Segments, Positioning Opportunity, Sources.
- **`constraints`** → `_context/planning/research/constraint-{topic}-{date}.md`: a **binding constraint envelope** (MUST-satisfy conditions, not a technology comparison) — Summary, Scope & axes, Blocking constraints (source + downstream impact), Preferred constraints, Aspirational targets, Conflicts flagged for Phase 3, Sources. Technology evaluation happens in Phase 3; this skill establishes what the chosen stack must honour.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 to 2026-04-24 | Alfred, Cadbury-hq | Original `domain-research`, `market-research`, `constraint-research` skills (migrated from bmad-domain-research / bmad-market-research / bmad-technical-research). `constraint-research` rewritten Wave 1.1-1.2 to produce a binding envelope rather than a technology comparison. |
| 2.0 | 2026-07-02 | Butler | Merged all three into `research` with `focus`/`depth` parameters (WS5-B, §5 P2, §8 item 6). Dropped the dead `coldpress graph query` CLI invocation from all three Step 1 scopes (WS0 §8 item 1 removed that CLI verb; replaced with direct `_input/reference/`+`_input/vendor/` reads). |
