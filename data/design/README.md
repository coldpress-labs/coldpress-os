# data/design — Design Reference Data

> Data-CSVs that Phase 5 design skills (`brand-guidelines`, `ux-design`, `design-brief`, `prototype`) consume to ground their output in concrete options. Pattern adapted from `nextlevelbuilder/ui-ux-pro-max-skill` (MIT). Closes Unit #28 / U08 from external-skills gap analysis 2026-05-03.

## Files

| File | Purpose | Consumer skills |
|---|---|---|
| `colors.csv` | 20 curated palettes — primary/secondary/accent/neutral_dark/mid/light + semantic (error/warning/success/info) + mood + WCAG-AA contrast flag | `brand-guidelines` token authoring; `a11y-audit` contrast verification |
| `typography.csv` | 12 font pairings — heading + body family, weight, letter-spacing, vibe, licensing, recommended-for | `brand-guidelines` typography section |
| `styles.csv` | 12 visual style archetypes — minimalist / brutalist / editorial / neumorphic / glassmorphic / etc. — with recommended-palette pairings | `design-brief` visual direction; `brand-guidelines` style framing |
| `stacks/react.csv` | React stack layer recommendations (routing / state / forms / validation / styling / components / animation / testing / build) | `ux-design` flow design (stack-aware); `prototype` skeleton scaffolding |
| `stacks/nextjs.csv` | Next.js stack (App Router / Server Actions / Drizzle / NextAuth / Vercel) | same |
| `stacks/svelte.csv` | SvelteKit 2 stack (Runes / superforms / Bits UI / Vercel-Cloudflare) | same |
| `stacks/vue.csv` | Vue 3 / Nuxt 3 stack (Pinia / VeeValidate / Radix Vue) | same |

## Sample-set scope

These are **representative sample sets**, not full inventories. nextlevelbuilder's source has ~97 palettes / ~57 font pairings / 8 stack frameworks; this initial seed has 20 / 12 / 4. Future expansion paths:

1. Pull more palettes from nextlevelbuilder/ui-ux-pro-max (MIT — vendorable)
2. Add more stack CSVs (svelte 4 → svelte 5 split; astro; remix; solidjs; angular)
3. Add `brand-archetypes.csv` (12-archetype framework: hero / sage / outlaw / etc.)
4. Add `motion-presets.csv` (timing functions + duration scales for animation systems)

## Schema

All CSVs use leading `id` column + flat columns. No nested JSON/YAML in CSV cells; if a value is multi-valued, comma-separate within quotes. Files stay parseable by both Python `csv` and JS `csv-parse` libs without custom dialects.

## Source attribution

Pattern + initial seed data adapted from [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (MIT, 73k★). Specific palette names, font-pairing names, and stack-recommendation phrasing in this seed are written original by Andy-coldpress-os; pattern (CSV-as-data-asset for design skills) is the borrowed concept.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U08) | Initial seed: 20 palettes + 12 typography pairings + 12 style archetypes + 4 framework stack CSVs (React / Next.js / Svelte / Vue). Pattern from nextlevelbuilder/ui-ux-pro-max-skill (MIT). |
