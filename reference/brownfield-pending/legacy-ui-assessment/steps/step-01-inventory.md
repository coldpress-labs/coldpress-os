---
step_number: 1
step_name: "Inventory + Categorise"
step_goal: "List legacy UI/design assets; categorise into components / tokens / style-guides / marketing-assets"
halts_for_input: false
next_step: "step-02-compare.md"
partial_completion_id: "legacy_ui_assessment_step_01"
---

## Goal

Inventory `_input/legacy/` UI/design files. Categorise per asset type for downstream comparison.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "legacy_ui_assessment_step_01", sub_skill: "inventory", at: "started" }`.

### 2. Scan `_input/legacy/`

Recursive scan. Filter for UI/design files by extension:
- Components: `.tsx`, `.jsx`, `.vue`, `.svelte`, `.ng.html`, `.pug`, `.hbs`
- Tokens: `*.tokens.json`, `tokens.css`, `theme.json`, `tailwind.config.js`, `theme.ts`
- Stylesheets: `.css`, `.scss`, `.sass`, `.less`, `.styl`
- Style guides: `style-guide.md`, `*-styleguide.md`, `brand-*.md`
- Design files: `*.figma`, `*.sketch`, `*.xd`, `*.fig`
- Marketing/illustrations: `assets/marketing/*`, `*.svg`, `*.png` in branded-asset directories

### 3. Categorise

| Category | Asset types |
|----------|-------------|
| components | Reusable UI components (.tsx/.vue/.svelte/etc.) |
| tokens | Design token files (CSS custom properties / JSON token files / Tailwind config) |
| stylesheets | Global / layout / utility CSS |
| style_guides | Authored style-guide markdown / brand books |
| design_files | Figma / Sketch / XD source files (cannot be auto-parsed; user-described) |
| marketing | Marketing creative / brand assets (logos, illustrations, photography) |

### 4. Initialise output document

Create `_context/design/legacy-ui-assessment-v{N}.md`:

```yaml
---
schema: schemas/design/legacy-ui-assessment.schema.json
phase: 5
version: <N>
sources:
  legacy_input: "_input/legacy/"
  design_brief: design-brief-v{db_version}
  brand_guidelines: brand-guidelines-v{bg_version|null-if-not-yet}
  legacy_migration_plan: legacy-migration-plan-v{lmp_version|null-if-greenfield-arch}
created_at: <ISO>
status: draft
distillate: true
sacred: false
asset_count: <N>
categories: { components: <N>, tokens: <N>, stylesheets: <N>, style_guides: <N>, design_files: <N>, marketing: <N> }
---

# Legacy UI Assessment

## Inventory

(populated below per category)
```

### 5. Append inventory tables per category

Per category, append:

```
### <Category> ({count})

| Asset | Path | Type | Notes |
|-------|------|------|-------|
| <name> | _input/legacy/... | <ext> | <auto-extracted notes; e.g., "uses --color-primary token: #336699"> |
```

For design files (Figma etc.) that can't be parsed: prompt user for description.

### 6. Partial-completion clean

`at: "inventoried"`.

## Output

- Output document scaffolded
- All legacy UI/design assets inventoried + categorised

## Navigation

→ Next: [step-02-compare.md](step-02-compare.md)
