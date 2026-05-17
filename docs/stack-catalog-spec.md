---
title: "Stack Catalog Spec"
version: "1.0"
date: "2026-04-24"
author: "Cadbury-hq"
---

# Stack Catalog Spec

Documents the shape and consumer contract of `data/stack-catalog/{area}.yaml` — the pre-loaded Tier-2 choice library used by `stack-discovery-sync` Step 3.

## File location

```
coldpress-os/data/stack-catalog/
  frontend.yaml
  hosting.yaml
  database.yaml
  auth.yaml
  cms.yaml
  styling.yaml
  package_manager.yaml
  testing.yaml
  ci.yaml
  source_control.yaml
```

One file per decision-area. v0.3 ships 10 areas (all listed above).

## Purpose

Catalog files pre-load curated top choices for each decision-area so stack-evaluation can work from a curated shortlist (Tier 2) rather than starting from scratch (Tier 3 — independent evaluation). They also carry `baselines_compat` scores so the Phase 3 evaluation rubric can flag candidates that fail a baseline category.

### 3-tier integration

| Tier | Source | How catalog is used |
|------|--------|---------------------|
| T1 — Pack pre-pick | `skills/stack-packs/*/pack.yaml pre_picked` | Catalog entries supplement the pre-pick as Tier 2 alternatives |
| T2 — Catalog top | `data/stack-catalog/{area}.yaml curated_top` | Primary candidate list for non-pack areas |
| T3 — Independent | Web search / graph query | Fallback when catalog doesn't fit or user rejects all T2 options |

## Per-area YAML shape

```yaml
area: string                    # Decision-area identifier (matches filename without .yaml)
fallback_behaviour: "independent-evaluation"  # Always this value for v0.3

curated_top:
  - name: string                # Technology name (unique within area)
    fits: []                    # Product types / scenarios this option suits well
    cost_tier: string           # Informal cost description (not a price calculator — qualitative)
    lock_in: number             # 1 (exit anytime) → 10 (very expensive to leave)
    baselines_compat:           # Compat per baselines.yaml category
      seo_aeo_llm: string       # "strong" | "neutral" | "weak" | "depends" | "needs plugin X"
      accessibility: string
      security: string
      future_proof: string
    notes: string               # Free-text: key trade-offs, gotchas, selection guidance
```

## `baselines_compat` scoring guide

Score each `baselines_compat` field against what the technology *provides out-of-box* (before any env-provision action):

| Value | Meaning |
|-------|---------|
| `"strong"` | The technology actively supports this baseline with minimal extra setup |
| `"neutral"` | No inherent advantage or disadvantage; baseline achievable with standard tooling |
| `"weak"` | The technology works against this baseline (e.g., client-rendering hurts SEO) |
| `"depends"` | Outcome depends on how the user configures it or what hosting they pair with |
| `"needs plugin X"` | Strong if the named plugin is added; otherwise neutral or weak |
| `"depends (user-owned)"` | Self-hosted; the user is entirely responsible for baseline compliance |

Scores are v0.3 best-available knowledge — they are not guaranteed to be exhaustive. Update post-v0.3 based on user feedback and framework evolution.

## `cost_tier` convention

`cost_tier` is a qualitative string — not a price calculator. Use these informal labels:

| Label | Meaning |
|-------|---------|
| `"free-oss"` | Open-source; no per-usage cost |
| `"solo-hobby-free"` | Free tier suitable for hobby / personal projects |
| `"solo-structured-low"` | Free tier exists; paid tier < $20/month for solo structured use |
| `"team-bootstrap-med"` | Paid tier $20–$200/month for small team |
| `"team-funded-high"` | > $200/month or enterprise pricing |
| `"any + infrastructure-cost"` | Self-hosted; platform cost is free, infrastructure is user-funded |
| `"included-with-{platform}"` | Bundled with another service the user already pays for |

Multiple tiers: pipe-separate: `"solo-hobby-free | solo-structured-low"`.

## `lock_in` scoring guide

1 = nearly zero exit cost (standard open format, any host accepts it)  
5 = moderate lock-in (migration possible but requires real effort)  
10 = very high exit cost (proprietary data format, or re-architecture required to leave)

## Adding new areas post-v0.3

Create `data/stack-catalog/{new-area}.yaml` following the schema above. Add the filename to the area list in this spec. No Phase 3 code changes required — `stack-discovery-sync` Step 3 discovers catalog files dynamically.

## Validator

JSON Schema: v0.3 does not ship a formal JSON schema for per-area catalog files (Wave 4 only adds schemas for planning-artefacts). Catalog YAMLs are validated by the `stack-discovery-sync` reader at runtime (required fields checked on load; unknown fields silently ignored). Formal schema planned post-v0.3.

---


---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 11 Shape A subagents (analyst · architect · pm · ux-designer · scrum-master · developer · qa · devops · reviewer · communicator · valet) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.
### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | ColdPress Labs | Initial spec. 10 v0.3 areas. baselines_compat scoring guide. cost_tier + lock_in conventions. |
