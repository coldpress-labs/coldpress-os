---
name: "static-single-page"
description: "Archetype-keyed starter pack for marketing landing pages, portfolios, and single-page brochure sites (Astro + Cloudflare Pages + Tailwind)"
type: "pack"
category: "stack-packs/static-single-page"
phases: [3]
version: "1.0"
---

## Purpose

The `static-single-page` pack provides a cohesive starting stack for marketing landing pages, portfolios, and single-purpose brochure sites. All four default-on baselines (SEO/AEO/LLM, accessibility, security, future-proof) are covered out-of-box.

## Pack Contents

| Skill | Phase | Purpose |
|-------|-------|---------|
| [quickstart](quickstart/) | 3 | Scaffold an Astro project + Cloudflare Pages config + Tailwind + baseline files |

## Pre-Picked Stack

| Area | Choice | Rationale |
|------|--------|-----------|
| Frontend | Astro | Zero JS by default; island architecture for any interactive components; excellent SEO/AEO support |
| Hosting | Cloudflare Pages | Free tier; edge deployment; fast global CDN; native `wrangler` tooling |
| Styling | Tailwind | Utility-first; zero runtime; pairs perfectly with Astro |
| Package manager | pnpm | Fast; disk-efficient |
| Source control | GitHub private | Default; swap to public when ready |

All decisions are `overrideable: true`. See `pack.yaml` for the full spec.
