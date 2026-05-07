---
workflow_version: "1.0"
output_file: "./"
total_steps: 6
resume_from: "frontmatter"
---

## Overview

Sets up an Astro multipage blog with MDX, Vercel, Tailwind, RSS, and baseline requirements.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | step-01-init-astro.md | Pick framework flavour + `pnpm create astro` |
| 2 | step-02-cms-choice.md | Pick CMS flavour (MDX default / headless alt) |
| 3 | step-03-vercel.md | Add Vercel adapter + `vercel.json` |
| 4 | step-04-tailwind.md | Install and configure Tailwind CSS |
| 5 | step-05-baselines.md | RSS feed + sitemap + llms.txt + robots.txt + blog post template |
| 6 | step-06-verify.md | Verify dev server + build + baseline files |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.

## Completion Criteria

- `pnpm dev` and `pnpm build` pass
- `/rss.xml`, `/sitemap-index.xml`, `/llms.txt`, `/robots.txt` present in build output
- At least one sample MDX blog post renders at `/blog/sample-post`
