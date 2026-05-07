---
name: seo-local
description: "Local SEO: NAP (Name/Address/Phone) consistency, Google Business Profile setup + optimisation, local-pack ranking factors, citation building, location-page templates, schema.org LocalBusiness markup. Conditional — runs when project archetype includes brick-and-mortar / service-area-business presence."
license: MIT
compatibility: Phase 5
version: "1.0"
---

## Purpose

Local SEO discipline — for brick-and-mortar businesses, service-area businesses, and multi-location chains. Five workstreams: **NAP consistency** (Name/Address/Phone matches across the open web; mismatches dilute local rankings), **Google Business Profile (GBP)** optimisation (the dominant local-pack signal), **local-pack ranking factors** (proximity, prominence, relevance), **citation building** (authoritative local directories), **location-page templates** (per-location landing pages with LocalBusiness schema).

**Conditional skill** — only runs when archetype includes `local-business` or `service-area-business`. Skipped silently for SaaS / global-content / e-commerce projects unless explicitly invoked.

## When to Use (Proactive Triggers)

1. Project archetype is `local-business` or `service-area-business`
2. User says "Google My Business" / "GBP" / "local SEO" / "rank in maps"
3. Multi-location project — need location pages + per-location citations
4. Brownfield project where NAP inconsistency suspected (different phone numbers / address formats across web presence)
5. Quarterly Phase 10 cadence — re-verify NAP after any business-info change

## Output Artifacts

1. **NAP-consistency audit** at `_context/audit/seo-local-nap-v{N}.md` — canonical NAP + every observed variation across known web presences (homepage, GBP, Yelp, Yellow Pages, social profiles, citations); flag mismatches
2. **GBP optimisation checklist** at `_context/audit/seo-local-gbp-v{N}.md` — categories selected, photos uploaded, hours accurate, services listed, attributes set, products listed, posts cadence, Q&A monitored, reviews replied to
3. **Citation-building plan** at `_context/planning/seo-local-citations-v{N}.md` — top-30 local-relevant directories ranked by Domain Rating + topical relevance; submission workflow
4. **Location-page templates** at `_context/design/seo-local-pages/<slug>-template-v{N}.md` — per-location: H1 target keyword + LocalBusiness schema + GeoCoordinates + OpeningHoursSpecification + map embed + reviews widget + service area + driving directions

## Prerequisites

- Project archetype confirmed local-business or service-area-business (else skill skips)
- Canonical business NAP defined (in context.md or `_input/legacy/business-info.*`)
- For multi-location: location list with addresses + phone numbers per location
- Phase 3 tech-stack locked (location-page templates need framework knowledge)

## Process

1. **Verify archetype** — skip if not local
2. **Read canonical NAP** from context.md / business-info source-of-truth
3. **NAP consistency scan**:
   - Crawl known web presences (homepage, GBP listing if URL known, citations)
   - Extract observed NAP per source
   - Flag mismatches (different phone formats, address variations, name truncations)
4. **GBP audit checklist**:
   - 16-point GBP optimisation list (categories / hours / photos / services / etc.)
   - Per-item: complete / incomplete / not-applicable
5. **Citation building**:
   - Top-30 directories: Yelp / Yellow Pages / BBB / Apple Maps / Bing Places / Foursquare / industry-specific (Houzz / Healthgrades / TripAdvisor / etc.)
   - Submission workflow + tracking sheet
6. **Location-page templates**:
   - One template per location with LocalBusiness schema
   - Inject NAP from canonical source
   - GeoCoordinates from address geocoding
7. **Emit all artefacts**

## Activation-Gate Checklist

- [ ] Archetype confirmed local; if not, skill silent-skipped
- [ ] Canonical NAP identified
- [ ] At least one web presence beyond homepage scanned for NAP
- [ ] GBP checklist completed (every item has a state)
- [ ] At least 10 citation targets listed
- [ ] Per-location template emitted (or single-location template if 1 location)

## Output

4 artefact types in `_context/audit/` + `_context/planning/` + `_context/design/`. Phase 8 implementation scaffolds location pages from templates. Phase 10 quarterly cadence re-audits NAP.

## Source Attribution

Pattern adapted from `AgriciDaniel/claude-seo` (MIT) `seo-local` + `seo-geo` + `seo-maps` skills. Implementation original to coldpress-os.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U13.local) | Initial seo-local sub-skill. Conditional on local archetype. Pattern from AgriciDaniel/claude-seo (MIT). |
