---
step_number: 2
step_name: "Configure Cloudflare Pages"
step_goal: "Add @astrojs/cloudflare adapter and wrangler.toml"
halts_for_input: false
next_step: "step-03-tailwind.md"
---

## Goal

Wire Cloudflare Pages as the deployment target via the Astro adapter.

## Instructions

1. Install the Cloudflare adapter:
   ```bash
   pnpm astro add cloudflare
   ```
   Accept prompts to update `astro.config.mjs`.

2. Create `wrangler.toml` at project root:
   ```toml
   name = "<project-slug-from-coldpress.yaml>"
   compatibility_date = "2024-01-01"
   pages_build_output_dir = "./dist"

   [site]
   bucket = "./dist"
   ```

3. Add `.dev.vars` to `.gitignore` (Cloudflare dev environment variables file).

4. Verify `astro.config.mjs` now contains `output: "static"` or `"server"` with the Cloudflare adapter.

## Output

- `wrangler.toml` created
- Cloudflare adapter installed and configured in `astro.config.mjs`

## Navigation

→ Next: [step-03-tailwind.md](step-03-tailwind.md)
