---
step_number: 5
step_name: "Install Baselines"
step_goal: "Add RSS feed, sitemap, llms.txt, robots.txt, and blog post template"
halts_for_input: false
next_step: "step-06-verify.md"
---

## Goal

Install seo_aeo_llm, accessibility, and future_proof baselines.

## Instructions

### seo_aeo_llm baseline

1. Install sitemap integration (if not already from step 2):
   ```bash
   pnpm astro add sitemap
   ```
   Add `site: "https://yourdomain.com"` to `astro.config.mjs`.

2. Create an RSS feed endpoint at `src/pages/rss.xml.ts`:
   ```typescript
   import rss from "@astrojs/rss";
   import { getCollection } from "astro:content";
   import type { APIContext } from "astro";

   export async function GET(context: APIContext) {
     const posts = await getCollection("blog");
     return rss({
       title: "Blog",
       description: "Latest posts",
       site: context.site!,
       items: posts.map((post) => ({
         title: post.data.title,
         pubDate: post.data.pubDate,
         description: post.data.description,
         link: `/blog/${post.slug}/`,
       })),
     });
   }
   ```

3. Create `public/llms.txt`:
   ```
   # LLM access policy
   User-agent: *
   Allow: /
   Sitemap: /sitemap-index.xml
   ```

4. Create `public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Sitemap: /sitemap-index.xml
   ```

5. Add OG meta to the root layout `<head>`.

### seo_aeo_llm — blog post template

6. Create `src/content/blog/sample-post.mdx` (or `.md`):
   ```mdx
   ---
   title: "Sample Post"
   description: "A sample blog post"
   pubDate: 2026-01-01
   tags: ["sample"]
   ---

   # Sample Post

   This is a sample blog post. Replace with your content.
   ```

7. Create `src/pages/blog/[...slug].astro` using `getStaticPaths` + `getEntry` from `astro:content`.

### accessibility baseline

8. Ensure all layout components use semantic HTML + `lang="en"` on `<html>`.

### future_proof baseline

9. Verify `tsconfig.json` has `"strict": true`.

## Output

- RSS feed at `/rss.xml`
- Sitemap plugin installed
- `public/llms.txt` and `public/robots.txt`
- Sample blog post + blog index page
- OG meta in layout

## Navigation

→ Next: [step-06-verify.md](step-06-verify.md)
