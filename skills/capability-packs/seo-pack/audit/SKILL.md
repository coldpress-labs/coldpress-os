---
name: "seo-audit"
description: "Baseline SEO state — technical health (crawlability / Core Web Vitals / broken links / sitemap validity) + content gaps (keyword coverage / cluster maturity) + competitive position. Emits prioritised remediation list. Quarterly cadence; also runs Phase 9 pre-deploy."
type: "simple"
category: "capability-packs/seo-pack"
phases: [3, 5, 9, 10]
license: "MIT"
version: "1.0"
updated: "2026-05-03"
inputs:
  graph_queries:
    - "personas (search-intent annotations)"
  cold_file_reads:
    - "_context/sacred/tech-stack.md (framework + hosting)"
    - "_context/planning/personas-*.md"
    - "coldpress.yaml (baselines.seo level)"
  existence_checks:
    - "Live site URL OR local dev URL passed by caller"
outputs:
  - artifact: "SEO audit report"
    location: "_context/audit/seo-audit-v{N}.md"
    format: "markdown"
    sacred: false
  - artifact: "Remediation priority list"
    location: "_context/audit/seo-remediation-v{N}.md"
    format: "markdown"
    sacred: false
---

## Purpose

Baseline-state audit across three axes: **technical health** (crawlability, performance, broken links, redirect chains, sitemap validity, robots.txt sanity), **content gaps** (keyword coverage vs persona search intents, topical-cluster maturity, thin-content pages), **competitive position** (top-3 SERP competitors, gap analysis, easy-win keywords).

Quarterly cadence in steady-state (Phase 10); also runs Phase 9 pre-deploy + Phase 3 (when SEO pack is selected — establishes baseline before any work).

## When to Use (Proactive Triggers)

1. Phase 3 — establish SEO baseline once stack is picked
2. Phase 5 — pre-content-strategy: know what gaps exist before authoring
3. Phase 9 pre-deploy gate — verify no SEO regression vs prior deploy
4. Phase 10 quarterly cadence — track drift; surface issues for next iteration
5. User says "audit SEO" / "where do we stand" / "SEO baseline"

## Output Artifacts

1. **SEO audit report** at `_context/audit/seo-audit-v{N}.md` — three sections (technical / content / competitive); each with findings + impact + evidence
2. **Remediation priority list** at `_context/audit/seo-remediation-v{N}.md` — ranked actions: P0 (broken sitemap / 5xx errors / no-index on important pages) → P1 (Core Web Vitals fail / missing title tags / duplicate content) → P2 (thin content / missing schema)
3. **Technical-health score** (0-100 per axis: crawlability / performance / on-page / structured-data) — feeds into `seo-strategy-v{N}.md` orchestration
4. **Keyword-coverage matrix** — persona search intents × covering pages; identifies uncovered intents

## Prerequisites

- Live URL OR local dev URL accessible to audit tooling
- Phase 2 personas with search-intent annotations
- Optional: Google Search Console API access (richer real-traffic data)
- Optional: external API keys (Ahrefs / SEMrush / DataForSEO) for competitive data

## Process

1. **Technical health checks**:
   - Crawlability: fetch robots.txt + sitemap.xml; verify reachable URLs match sitemap; spot-check `<link rel="canonical">` on top pages
   - Core Web Vitals: Lighthouse (or PageSpeed Insights API) on top 5 pages; LCP/INP/CLS scores
   - Broken links: depth-2 crawl from homepage; flag 4xx/5xx + redirect chains >3 hops
   - Sitemap: validate against [sitemaps.org schema](https://www.sitemaps.org/protocol.html); check lastmod freshness
2. **Content gaps**:
   - For each persona search-intent: does a page target it? (URL pattern / page title / H1 match)
   - Topical-cluster maturity: hub pages have ≥5 supporting pages? Internal linking density?
   - Thin content: pages <300 words flagged (unless intentional — PDF stub, dispatch page)
3. **Competitive position** (if data sources available):
   - Top-3 SERP competitors per priority keyword
   - Gap analysis: what's their content footprint vs ours?
   - Easy-win keywords: low-difficulty + medium-volume + relevance match
4. **Score computation** + **remediation ranking**
5. **Emit reports**

## Activation-Gate Checklist

- [ ] Live URL or dev URL accessible
- [ ] Technical health checks executed (or skipped with reason)
- [ ] Content gaps mapped against persona search intents
- [ ] Score per axis computed
- [ ] Remediation list ranked P0/P1/P2

## Output

Two reports + score matrix in `_context/audit/`. Phase 9 deploy gate BLOCKS on P0 findings. Quarterly Phase 10 cadence tracks drift.

## Source Attribution

Pattern adapted from `AgriciDaniel/claude-seo` (MIT) `seo-audit` + `seo-technical` skills. Implementation original to coldpress-os.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U13.audit) | Initial seo-audit sub-skill of seo-pack. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from AgriciDaniel/claude-seo (MIT). |
