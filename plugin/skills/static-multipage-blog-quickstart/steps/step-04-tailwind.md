---
step_number: 4
step_name: "Install Tailwind CSS"
step_goal: "Add Tailwind CSS (skip if Next.js already included it)"
halts_for_input: false
next_step: "step-05-baselines.md"
---

## Goal

Add Tailwind CSS to the Astro project. Skip this step if Next.js was chosen (Tailwind was added during `create next-app`).

## Instructions

1. For Astro only:
   ```bash
   pnpm astro add tailwind
   ```
   Accept prompts. Verify `tailwind.config.mjs` content glob includes `.astro`, `.mdx`, `.md` files.

2. Add a base global CSS file at `src/styles/global.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. Import global CSS in the root layout.

4. For Next.js: verify `globals.css` already has the Tailwind directives (they're added by `create next-app`).

## Output

- Tailwind CSS installed and configured
- Global CSS with Tailwind layers

## Navigation

→ Next: [step-05-baselines.md](step-05-baselines.md)
