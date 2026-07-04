---
name: styleguide
description: "Author the styleguide (P5) — the live `/styleguide` route that renders every token role + component in light/dark, plus its manifest _context/design/styleguide.yaml (sections → components/token-roles + visual-baseline config). The styleguide is the design system made observable: `visual-verify` (P8) diffs a story's rendered UI against the styleguide's captured baselines, so an unintended visual change fails and an intended one re-baselines."
license: MIT
compatibility: Invoked by @ux-designer in Phase 5
version: "1.0"
---

## Purpose

Tokens in a JSON file are invisible; the styleguide makes them **observable**. It is a live in-app route (`/styleguide`) that renders every token role and every component in light + dark, and a manifest (`styleguide.yaml`) that declares what that route covers and where its baselines live. `visual-verify` diffs a story's rendered UI against these baselines — so the styleguide is not documentation, it is the reference the enforcement compares against.

## When to Use

- After `design-tokens` emits `tokens.json` and `ux-design-spec` lists the components, before Phase 8 (where `visual-verify` needs the baselines to diff against).
- Re-run when a token or component changes: re-render the route, re-capture baselines (an intended re-baseline), and bump the manifest.

## Prerequisites

- `_context/design/tokens.json` exists (the styleguide renders from it — single source).
- `ux-design-spec-v{N}.md` exists (the component inventory the sections mirror).

## Process

1. **Scaffold the `/styleguide` route** in the app — a page that imports `tokens.css` and renders, per section, every component in the ux-spec at each supported theme. This is code (a real route), not a doc; it must build and render for baselines to be captured.

2. **Cover the token roles.** Ensure the route exercises every colour role, type size, and spacing step the tokens declare — the styleguide is where a token with no visible usage is caught early.

3. **Capture visual baselines** — screenshot the route (per theme, per viewport) into the baselines directory. These become the golden images `visual-verify` diffs against; commit them so a diff is reviewable.

4. **Author `_context/design/styleguide.yaml`** (`schemas/design/styleguide.schema.ts`): `route` (default `/styleguide`), `tokens_ref` (the tokens file), `sections[]` (each `id` + `title` + `components[]` + optional `token_roles[]`), and `baselines` (`dir`, `themes`, optional `viewports`). Validate it.

   ```yaml
   route: "/styleguide"
   tokens_ref: "_context/design/tokens.json"
   sections:
     - { id: buttons, title: Buttons, components: [Button, IconButton], token_roles: [primary, text] }
     - { id: forms, title: Forms, components: [Input, Select] }
   baselines: { dir: "_context/design/visual-baselines", themes: [light, dark], viewports: [375, 1280] }
   ```

## Output

`_context/design/styleguide.yaml` (the manifest) + the live `/styleguide` route + captured baselines. Consumed by `visual-verify` (P8) as the diff reference.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-04 | Butler (v0.4 WS10-A2) | NEW P5 producer (system-integration audit A2: `styleguide.yaml` + the `/styleguide` route are consumed by `visual-verify` and the F6 design registry, but no skill created them). Authors the live styleguide route + captured baselines + the schema'd manifest, closing the producer break for the visual-baselines diff. |
