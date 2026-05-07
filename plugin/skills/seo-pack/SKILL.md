---
name: seo-pack
description: "Archetype-keyed SEO discipline pack for content sites, marketing, e-commerce, and local businesses. Five sub-skills: audit / content / schema / local / technical. Engine-agnostic — wraps any frontend stack. Invocable across Phase 3 (stack pick) / Phase 5 (content design) / Phase 8 (implementation) / Phase 9-10 (deploy + steady-state)."
license: MIT
compatibility: Phase 3
version: "1.0"
---

## Purpose

Comprehensive SEO discipline pack. Five sub-skills cover the SEO surface from audit (where you are) → strategy (what to build) → execution (how to ship). Engine-agnostic: wraps Next.js / Astro / SvelteKit / Nuxt / WordPress / static-HTML — sub-skills emit framework-specific scaffolds.

Pattern adapted from `AgriciDaniel/claude-seo` (MIT, 5.9k★) — 21 sub-skills consolidated into 5 thematic clusters that match coldpress-os's pack-as-bundle convention.

## Pack Contents

| Sub-skill | Phase | Purpose |
|-----------|-------|---------|
| [audit](audit/) | 3, 5, 9, 10 | Baseline state: technical health (crawlability, Core Web Vitals, broken links), content gaps (keyword coverage, cluster maturity), competitive position |
| [content](content/) | 5 | Content strategy: keyword research, cluster/topical authority, programmatic SEO templates, content briefs |
| [schema](schema/) | 8 | Structured data: JSON-LD schema.org markup, Open Graph, Twitter Cards, JSON-LD per content-type (Article / Product / Organisation / FAQPage / HowTo / LocalBusiness) |
| [local](local/) | 5, 8 | Local SEO: NAP (Name/Address/Phone) consistency, Google Business Profile, local-pack ranking factors, citation building |
| [technical](technical/) | 8, 9 | Crawl optimisation: sitemap.xml, robots.txt, hreflang, canonical tags, redirects, performance (LCP/INP/CLS), mobile responsiveness |

## When to Use (Proactive Triggers)

1. Project has an SEO requirement (marketing site / blog / e-commerce / local business)
2. User says "set up SEO" / "audit our SEO" / "make this rank" / "structured data"
3. Phase 3 stack-pack selection — picked when archetype matches `content-site` / `marketing-site` / `e-commerce` / `local-business`
4. Phase 5 design pass — content sub-skill informs UX-spec content blocks
5. Phase 8/9 implementation + deploy — schema + technical sub-skills emit scaffolds
6. Phase 10 steady-state — quarterly audit cadence

## Output Artifacts

1. **Pack-level SEO strategy** at `_context/planning/seo-strategy-v{N}.md` — orchestrator output: which sub-skills run when, dependencies, sequence
2. **Per-sub-skill artefacts** — see each sub-skill's SKILL.md for outputs
3. **SEO-baseline policy** in `coldpress.yaml` `baselines.seo` block — locked at Phase 3

## Pre-Picked Stack

SEO pack is **engine-agnostic** — no frontend pre-pick. Sub-skills emit framework-specific scaffolds based on project's tech-stack lock (Phase 3 output):

| Tech Stack | Schema injection | Sitemap | Local optimisation |
|---|---|---|---|
| Next.js | `<Head>` + `generateMetadata()` | `app/sitemap.ts` | Server Components |
| Astro | `<head>` + content collections | `@astrojs/sitemap` | Static at build |
| SvelteKit | `+layout.svelte` + `+page.ts` | `+page.server.ts` sitemap | Server-rendered |
| Nuxt | `useHead()` + `useSeoMeta()` | `@nuxtjs/sitemap` | Hybrid |
| WordPress | Yoast / RankMath / native | wp-sitemap.xml | GBP plugin integration |
| Static HTML | inline `<head>` | hand-authored | manual |

## Prerequisites

- Phase 3 tech-stack locked (sub-skills need to know the framework)
- `coldpress.yaml` `baselines.seo` block specified (level: basic | competitive | aggressive)
- Personas exist (Phase 2 output) — drives search-intent targeting

## Process

This is a **pack** — invoke sub-skills directly per phase. No top-level workflow.

Recommended sequence per project archetype:

| Archetype | Phase 3 | Phase 5 | Phase 8 | Phase 9 | Phase 10 |
|---|---|---|---|---|---|
| Marketing site | audit | content + local | schema + technical | technical | audit (quarterly) |
| Blog | audit | content | schema + technical | technical | audit |
| E-commerce | audit | content + schema (Product) | schema + technical | technical | audit |
| Local business | audit | local + content | local + schema (LocalBusiness) | technical | audit + local |

## Activation-Gate Checklist

- [ ] tech-stack.md locked (Phase 3 complete)
- [ ] coldpress.yaml baselines.seo level set
- [ ] At least one persona has search-intent annotation
- [ ] Pack-level seo-strategy-v{N}.md emitted (orchestrates which sub-skills run when)
- [ ] Per-sub-skill activation-gates pass independently

## Output

Pack-level strategy doc + per-sub-skill artefacts. SEO discipline becomes a first-class concern across Phases 3 → 10 rather than an afterthought.

## Source Attribution

Pattern adapted from [`AgriciDaniel/claude-seo`](https://github.com/AgriciDaniel/claude-seo) (MIT, 5.9k★). Original repo has 21 sub-skills + 3 extension packs (DataForSEO/Firecrawl/Banana); coldpress-os consolidates into 5 thematic clusters that match the pack-as-bundle convention. Extension-pack integrations (DataForSEO API / Firecrawl scrape) deferred to project-specific extensions, not framework-default.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U13) | Initial seo-pack stack-pack. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from AgriciDaniel/claude-seo (MIT). 5 sub-skills (audit/content/schema/local/technical). Engine-agnostic; framework-specific scaffolds emitted by sub-skills. |
