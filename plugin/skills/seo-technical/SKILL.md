---
name: seo-technical
description: "Crawl-optimisation + on-page technical SEO: sitemap.xml, robots.txt, canonical tags, hreflang (i18n), redirect map, performance (Core Web Vitals — LCP/INP/CLS), mobile responsiveness, render-blocking resources, image-optimisation. Framework-aware emit; integrates with Phase 9 deploy + Phase 10 monitoring."
license: MIT
compatibility: Phase 8
version: "1.0"
---

## Purpose

Technical-axis SEO. Six workstreams: **sitemap.xml** (every public URL listed; lastmod accurate; sitemap-index.xml if >50k URLs), **robots.txt** (allow/disallow rules; sitemap reference), **canonical + hreflang** (duplicate-content prevention; multi-language tagging), **redirect map** (301 chains tracked; one-hop max), **performance** (Core Web Vitals — LCP/INP/CLS targets per `baselines.performance`), **on-page hygiene** (image alt-text, lazy-load, render-blocking resources).

Framework-aware: emit sitemap as `app/sitemap.ts` (Next.js) / `@astrojs/sitemap` config (Astro) / `+page.server.ts` for SvelteKit / `nuxt.config.ts` (Nuxt) / `public/sitemap.xml` (static). Reads `tech-stack.md` to pick the right scaffold.

## When to Use (Proactive Triggers)

1. Phase 8 implementation — sitemap + robots + canonical baseline at first publish
2. Phase 9 pre-deploy — verify config valid; performance audit
3. URL structure changes — redirect map update
4. Multi-language launch — hreflang config
5. Performance regression alert — re-run performance audit
6. User says "sitemap" / "robots" / "Core Web Vitals" / "page speed"

## Output Artifacts

1. **sitemap.xml** (or sitemap-index.xml + per-section sitemaps if >50k URLs) — framework-emitted
2. **robots.txt** — Allow/Disallow rules + Sitemap directive + Crawl-delay (if needed)
3. **Canonical + hreflang config** — per-page metadata templates
4. **Redirect map** — config for hosting platform (Vercel/Netlify/Cloudflare/.htaccess); tracks every redirect with status code (301 default; 302 only if temporary)
5. **Performance audit + remediation** — Lighthouse + WebPageTest results; per-page LCP/INP/CLS; remediation list ranked by impact

## Prerequisites

- Phase 3 tech-stack locked
- Phase 5 seo-content content strategy (informs sitemap structure + priority/changefreq hints)
- coldpress.yaml `baselines.performance` block specifies Core Web Vitals targets
- Live URL or staging URL accessible for performance audit

## Process

1. **Read tech-stack.md** + `baselines.performance` targets
2. **Sitemap generation:**
   - Enumerate public URLs (from page tree / content collection / CMS query)
   - Per URL: lastmod (file mtime / DB updated_at), priority hint, changefreq
   - Emit framework-specific (Next.js `app/sitemap.ts` returns array; Astro plugin auto-generates; static = hand-written XML)
3. **robots.txt:**
   - Allow `/` by default
   - Disallow admin / search / staging paths if any
   - Sitemap directive pointing to canonical sitemap URL
4. **Canonical + hreflang:**
   - Per-page canonical (default = self; override for syndicated content)
   - Hreflang per language variant (multi-language only)
5. **Redirect map:**
   - Audit existing redirects — flag chains >1 hop, 302s that should be 301s
   - Emit consolidated config
6. **Performance audit:**
   - Run Lighthouse on top 5 pages
   - Compare LCP/INP/CLS vs `baselines.performance` targets
   - Per-failure: remediation (image-format / render-blocking / preconnect / lazy-load)
7. **Emit all artefacts**

## Activation-Gate Checklist

- [ ] tech-stack.md identifies framework + emit pattern
- [ ] sitemap.xml emitted; URLs reachable (spot-check)
- [ ] robots.txt emitted with Sitemap directive
- [ ] Canonical configured for top pages (homepage + key landing + content templates)
- [ ] Redirect map verified — no chains >1 hop
- [ ] Core Web Vitals audit completed; failures flagged with remediation

## Output

4 framework-emitted config files + 1 audit report. Phase 9 deploy gate verifies sitemap valid + robots reachable + Core Web Vitals targets met.

## Source Attribution

Pattern adapted from `AgriciDaniel/claude-seo` (MIT) `seo-technical` + `seo-page` + `seo-sitemap` + `seo-hreflang` + `seo-images` + `seo-drift` skills. Implementation original to coldpress-os; framework-aware emit.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U13.technical) | Initial seo-technical sub-skill. Pattern from AgriciDaniel/claude-seo (MIT). |
