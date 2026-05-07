---
step_number: 1
step_name: "Initialize Astro Project"
step_goal: "Run pnpm create astro with the right template for the project type"
halts_for_input: true
next_step: "step-02-cloudflare-pages.md"
---

## Goal

Initialize the Astro project with a template that matches the site's purpose.

## Instructions

1. Check the project's `product_type` from `coldpress.yaml` (or ask if not set):
   - `marketing-landing` → use `minimal` or `basics` template
   - `portfolio` → use `portfolio` template
   - `single-page-brochure` → use `minimal` template

2. Ask the user:

**Question:** Which Astro template would you like to start from?
- **(A)** `minimal` — blank HTML page, maximum control
- **(B)** `basics` — three pages, navbar, footer
- **(C)** `portfolio` — pre-built portfolio layout with project cards
- **(D)** Tell me the template name to use

[Wait for user input]

3. Run:
   ```bash
   pnpm create astro@latest . --template <choice> --no-install --typescript strict
   ```
   (Use `.` to scaffold into the existing project root.)

4. Run `pnpm install`.

## Output

- Astro project files at project root
- `pnpm install` complete

## Navigation

→ Next: [step-02-cloudflare-pages.md](step-02-cloudflare-pages.md)
