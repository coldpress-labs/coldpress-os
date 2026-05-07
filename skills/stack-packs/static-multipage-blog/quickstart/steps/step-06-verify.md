---
step_number: 6
step_name: "Verify Dev Environment"
step_goal: "Confirm the blog project starts, builds, and has all baseline files"
halts_for_input: false
next_step: null
---

## Goal

Verify the multipage blog project starts and builds successfully with all baseline outputs present.

## Instructions

1. Start the dev server:
   ```bash
   pnpm dev
   ```
   Confirm it starts without errors. Visit `localhost:4321/blog` — sample post should render.

2. Run the production build:
   ```bash
   pnpm build
   ```
   Confirm it exits with code 0.

3. Verify in `dist/` post-build:
   - `dist/rss.xml` — RSS feed
   - `dist/sitemap-index.xml` — sitemap
   - `dist/llms.txt` — LLM access policy
   - `dist/robots.txt` — robots
   - `dist/blog/sample-post/index.html` — blog post renders

4. TypeScript check:
   ```bash
   pnpm exec tsc --noEmit
   ```

5. Report to Butler: "env-provision complete — static-multipage-blog pack scaffolded. Dev server ✅, build ✅, RSS ✅, baselines ✅."

## Output

- Project passes `pnpm dev` and `pnpm build`
- All baseline files confirmed
- Blog post renders at `/blog/sample-post`
