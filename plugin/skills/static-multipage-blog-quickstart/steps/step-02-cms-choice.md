---
step_number: 2
step_name: "Choose CMS Flavour"
step_goal: "Decide between file-based MDX (default) or a headless CMS"
halts_for_input: true
next_step: "step-03-vercel.md"
---

## Goal

Pick the content authoring approach. MDX (file-based) is the default — no external service, posts live in the repo.

## Instructions

1. Ask:

**Question:** How would you like to manage blog content?
- **(A)** MDX files in the repo (default — version-controlled, no external service)
- **(B)** Sanity (headless CMS — real-time preview, collaborative editing)
- **(C)** Keystatic (Git-based CMS — local editor, flat files)
- **(D)** Something else (specify)

[Wait for user input]

2. For MDX (Option A):
   ```bash
   pnpm add @astrojs/mdx @astrojs/rss
   pnpm astro add mdx
   ```
   Create `src/content/blog/` directory and add `config.ts` defining the blog collection.

3. For Sanity (Option B):
   ```bash
   pnpm create sanity@latest --template clean --no-typescript
   pnpm add @sanity/client
   ```
   User will need to configure `projectId` and `dataset` from their Sanity dashboard.

4. For Keystatic (Option C):
   ```bash
   pnpm add @keystatic/core @keystatic/astro
   ```
   Add Keystatic integration in `astro.config.mjs`.

## Output

- CMS integration installed and configured
- `src/content/blog/` present (MDX) or CMS client configured (headless)

## Navigation

→ Next: [step-03-vercel.md](step-03-vercel.md)
