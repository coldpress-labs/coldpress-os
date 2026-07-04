---
name: static-multipage-blog-quickstart
description: "Initialize a static-multipage-blog project: Astro + Vercel + MDX + Tailwind + RSS feed + sitemap + llms.txt + blog post template"
license: MIT
compatibility: Invoked by @developer in Phase 3
version: "1.0"
---

## Purpose

Scaffolds an Astro multipage blog with Vercel deployment, MDX content authoring, Tailwind CSS, and pre-installed baseline requirements.

## When to Use

- `stack_pack: "static-multipage-blog"` is set in `coldpress.yaml`
- env-provision Step 0 dispatches to this skill (pack-branch)

## Process

→ See [workflow.md](workflow.md) for the full process.

## Output

- Astro project with blog collection configured
- MDX installed + sample blog post template
- RSS feed at `/rss.xml`
- Sitemap, `llms.txt`, `robots.txt`
- Vercel deployment configuration
- `pnpm dev` and `pnpm build` passing
