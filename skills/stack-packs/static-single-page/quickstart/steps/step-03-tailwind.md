---
step_number: 3
step_name: "Install Tailwind CSS"
step_goal: "Add Tailwind CSS to the Astro project"
halts_for_input: false
next_step: "step-04-baselines.md"
---

## Goal

Add Tailwind CSS using the official Astro integration.

## Instructions

1. Run:
   ```bash
   pnpm astro add tailwind
   ```
   Accept the prompt to install `@astrojs/tailwind` and create `tailwind.config.mjs`.

2. Verify `tailwind.config.mjs` has the correct `content` glob:
   ```js
   content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}']
   ```

3. Add a base layer reset to `src/styles/global.css` (create if absent):
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. Import `global.css` in the root layout component.

## Output

- `@astrojs/tailwind` installed
- `tailwind.config.mjs` created
- Global CSS importing Tailwind layers

## Navigation

→ Next: [step-04-baselines.md](step-04-baselines.md)
