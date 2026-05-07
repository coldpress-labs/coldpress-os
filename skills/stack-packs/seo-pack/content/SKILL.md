---
name: "seo-content"
description: "Content strategy + cluster/topical authority + programmatic SEO templates. Produces content brief per target keyword, internal-linking map for topical clusters, programmatic-page templates for high-volume thin-cardinality patterns (city pages, comparison pages, integration pages)."
type: "simple"
category: "stack-packs/seo-pack"
phases: [5]
license: "MIT"
version: "1.0"
updated: "2026-05-03"
inputs:
  graph_queries:
    - "personas (search-intent annotations)"
    - "Page nodes (existing content inventory)"
  cold_file_reads:
    - "_context/audit/seo-audit-v{latest}.md (gap analysis input)"
    - "_context/planning/personas-*.md"
    - "_context/sacred/context.md"
  existence_checks:
    - "Phase 2 personas exist with search-intent annotations"
    - "seo-audit ran (gap analysis available)"
outputs:
  - artifact: "Content strategy"
    location: "_context/design/seo-content-strategy-v{N}.md"
    format: "markdown"
    sacred: false
  - artifact: "Cluster map + internal-linking plan"
    location: "_context/design/seo-cluster-map-v{N}.md"
    format: "markdown"
    sacred: false
  - artifact: "Per-page content briefs"
    location: "_context/design/seo-content-briefs/<slug>-v{N}.md"
    format: "markdown"
    sacred: false
  - artifact: "Programmatic SEO templates"
    location: "_context/design/seo-programmatic/<pattern>-template-v{N}.md"
    format: "markdown"
    sacred: false
---

## Purpose

Content-axis SEO. Three deliverables: (1) **content strategy** — what topics to own, in what priority order, on what cadence; (2) **cluster/topical authority map** — hub pages + supporting pages + internal linking; (3) **programmatic templates** — for high-volume thin-cardinality patterns (city pages, vs-comparison pages, integration pages, glossary pages) that scale via templating + data injection.

## When to Use (Proactive Triggers)

1. Phase 5 entry — once seo-audit baseline is known
2. User says "content strategy" / "topical authority" / "programmatic SEO"
3. Re-run after major persona update (new search intent surfaced)
4. Quarterly during Phase 10 (refresh strategy as SERP evolves)

## Output Artifacts

1. **Content strategy** at `_context/design/seo-content-strategy-v{N}.md` — topic priorities, cadence (e.g., 4 hub pages + 12 spokes per quarter), success metrics (organic traffic / keyword rankings / lead-gen attribution)
2. **Cluster map** at `_context/design/seo-cluster-map-v{N}.md` — per topic: hub URL + spoke URLs + internal-linking pattern + crosslinks between clusters
3. **Per-page content briefs** at `_context/design/seo-content-briefs/<slug>-v{N}.md` — one per priority page: target keyword + secondary keywords + search intent + competitor outline + recommended H2s + word-count target + internal links + schema type
4. **Programmatic templates** at `_context/design/seo-programmatic/<pattern>-template-v{N}.md` — for templated content: data source, Mustache-style placeholder fields, page structure, internal-linking pattern across the set

## Prerequisites

- seo-audit has run (gap analysis informs priorities)
- Phase 2 personas exist with search-intent annotations
- Tech-stack supports the chosen content shape (Astro/Next.js for programmatic; WordPress for hub-spoke; static for hand-authored)

## Process

1. **Read seo-audit gaps** + persona search-intents
2. **Cluster topics** — group keywords by parent topic (hub) + child variations (spokes); aim for 10-20 clusters
3. **Prioritise** — easy-win keywords first; high-traffic high-difficulty later
4. **Author content briefs** for top-N priority pages (default: top 10)
5. **Identify programmatic patterns** — if any keyword set has cardinality >20 with templated structure (cities, comparisons), draft a programmatic template instead of N hand-authored briefs
6. **Internal-linking plan** — every spoke links to hub; hub links to all spokes; cross-cluster links where topical adjacency exists
7. **Emit strategy + cluster map + briefs + templates**

## Activation-Gate Checklist

- [ ] At least one cluster identified per priority persona search-intent
- [ ] Per-page briefs cover top-N priority targets
- [ ] Programmatic templates drafted where cardinality justifies
- [ ] Internal-linking pattern documented
- [ ] Strategy specifies cadence + success metrics

## Output

4 artefact types in `_context/design/seo-*`. Phase 5 ux-design + Phase 8 implementation consume to scaffold actual pages.

## Source Attribution

Pattern adapted from `AgriciDaniel/claude-seo` (MIT) `seo-content` + `seo-cluster` + `seo-programmatic` skills. Implementation original.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U13.content) | Initial seo-content sub-skill. Pattern from AgriciDaniel/claude-seo (MIT). |
