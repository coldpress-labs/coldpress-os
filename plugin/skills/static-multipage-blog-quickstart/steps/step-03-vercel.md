---
step_number: 3
step_name: "Configure Vercel Deployment"
step_goal: "Add Vercel adapter and vercel.json"
halts_for_input: false
next_step: "step-04-tailwind.md"
---

## Goal

Configure Vercel as the deployment target.

## Instructions

1. For Astro:
   ```bash
   pnpm astro add vercel
   ```
   Accept prompts. This adds `@astrojs/vercel` and updates `astro.config.mjs`.

2. For Next.js, Vercel is the default — skip adapter installation.

3. Create `vercel.json` at project root:
   ```json
   {
     "framework": "astro"
   }
   ```
   (Use `"nextjs"` for Next.js projects.)

4. Add `.vercel/` to `.gitignore` if not already present.

## Output

- Vercel adapter installed (Astro) or confirmed (Next.js)
- `vercel.json` created

## Navigation

→ Next: [step-04-tailwind.md](step-04-tailwind.md)
