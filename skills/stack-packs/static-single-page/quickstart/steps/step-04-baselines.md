---
step_number: 4
step_name: "Install Baselines"
step_goal: "Add sitemap plugin, llms.txt, robots.txt, and OG meta scaffolding"
halts_for_input: false
next_step: "step-05-verify.md"
---

## Goal

Install all four out-of-box baselines for the static-single-page pack: seo_aeo_llm, accessibility, security, and future_proof.

## Instructions

### seo_aeo_llm baseline

1. Install sitemap integration:
   ```bash
   pnpm astro add sitemap
   ```
   Add `site: "https://yourdomain.com"` to `astro.config.mjs` (placeholder — user updates at deploy time).

2. Create `public/llms.txt`:
   ```
   # LLM access policy
   # Project: <project-name>
   # Description: <one-line from coldpress.yaml>
   
   User-agent: *
   Allow: /
   
   # Sitemap
   Sitemap: /sitemap-index.xml
   ```

3. Create `public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Sitemap: /sitemap-index.xml
   ```

4. In the root layout `<head>`, add OG meta scaffolding:
   ```html
   <meta property="og:title" content={title} />
   <meta property="og:description" content={description} />
   <meta property="og:type" content="website" />
   <meta name="description" content={description} />
   ```

### accessibility baseline

5. Ensure all layout components use semantic HTML (`<header>`, `<main>`, `<footer>`, `<nav>`).
6. Add `lang="en"` to the root `<html>` element (update if project targets another language).

### security baseline

7. Add a `Content-Security-Policy` header in `wrangler.toml` under `[headers]`:
   ```toml
   [[headers]]
   for = "/*"
     [headers.values]
     Content-Security-Policy = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';"
   ```

### future_proof baseline

8. Verify `tsconfig.json` (created by Astro) has `"strict": true` in `compilerOptions`.

## Output

- Sitemap plugin installed and configured
- `public/llms.txt` and `public/robots.txt` created
- OG meta scaffolding in root layout
- Semantic HTML structure
- CSP header in wrangler.toml
- TypeScript strict mode confirmed

## Navigation

→ Next: [step-05-verify.md](step-05-verify.md)
