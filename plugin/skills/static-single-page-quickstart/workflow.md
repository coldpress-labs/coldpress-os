---
workflow_version: "1.0"
output_file: "./"
total_steps: 5
resume_from: "frontmatter"
---

## Overview

Sets up an Astro + Cloudflare Pages + Tailwind project with all four baseline requirements pre-installed.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | step-01-init-astro.md | Pick Astro template flavour + `pnpm create astro` |
| 2 | step-02-cloudflare-pages.md | Configure `wrangler.toml` + Cloudflare Pages adapter |
| 3 | step-03-tailwind.md | Install and configure Tailwind CSS |
| 4 | step-04-baselines.md | Add sitemap plugin + `public/llms.txt` + `public/robots.txt` + OG meta |
| 5 | step-05-verify.md | Run `pnpm dev` + verify build passes |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- `pnpm dev` starts without errors
- `pnpm build` passes
- `public/llms.txt`, `public/robots.txt`, and sitemap plugin present
- `wrangler.toml` configured for Cloudflare Pages deployment
