---
name: "quickstart"
description: "Initialize a static-single-page project: Astro + Cloudflare Pages + Tailwind + baseline files (sitemap, llms.txt, robots.txt)"
type: "workflow"
category: "stack-packs/static-single-page"
agent: "developer"
phases: [3]
inputs:
  cold_file_reads:
    - "coldpress.yaml"
    - "_context/sacred/tech-stack.md"
outputs:
  - artifact: "Initialized Astro project with Cloudflare Pages config + Tailwind + baseline files"
    location: "./"
    format: "directory"
version: "1.0"
---

## Purpose

Scaffolds a new Astro project configured for Cloudflare Pages deployment, adds Tailwind CSS, and installs the four baseline requirements: sitemap plugin (SEO/AEO), `public/llms.txt` (LLM discoverability), robots.txt (SEO), and a11y-ready semantic HTML structure.

## When to Use

- `stack_pack: "static-single-page"` is set in `coldpress.yaml`
- env-provision Step 0 dispatches to this skill (pack-branch)

## Prerequisites

- Phase 3 stack-locking complete (`_context/sacred/tech-stack.md` locked)
- `coldpress update --post-phase-3` has run

## Process

→ See [workflow.md](workflow.md) for the full process.

## Output

- Astro project initialized at project root
- `wrangler.toml` configured for Cloudflare Pages
- Tailwind CSS installed + configured
- Baseline files: `public/sitemap.xml` stub, `public/llms.txt`, `public/robots.txt`, OG meta scaffolding in layout
- Dev server verified (`pnpm dev` passes)
