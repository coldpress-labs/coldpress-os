---
step_number: 1
step_name: "Initialize Astro Project"
step_goal: "Scaffold an Astro project with the blog template"
halts_for_input: true
next_step: "step-02-cms-choice.md"
---

## Goal

Initialize the Astro project with a template suited for a multipage blog.

## Instructions

1. Ask:

**Question:** Which framework would you like to use?
- **(A)** Astro (default — best SEO, zero JS, excellent blog support)
- **(B)** Next.js (App Router — if you need SSR features)

[Wait for user input]

2. For Astro:
   ```bash
   pnpm create astro@latest . --template blog --no-install --typescript strict
   pnpm install
   ```

3. For Next.js:
   ```bash
   pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
   ```
   (Tailwind is added in a later step for Astro; Next.js adds it here.)

## Output

- Project scaffolded with blog structure
- `pnpm install` complete

## Navigation

→ Next: [step-02-cms-choice.md](step-02-cms-choice.md)
