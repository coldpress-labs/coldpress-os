---
name: "design-tokens"
description: "Emit the design tokens as the enforcement contract (P5) — _context/design/tokens.json, the machine-readable single source of truth for colour/type/spacing/radii/motion, extracted from the brand-guidelines token section. `coldpress tokens build` then generates the code binding (CSS custom properties + dark-mode) FROM this file, so the build consumes tokens by construction and divergence becomes impossible rather than merely detectable. `visual-verify` (P8) checks usage against it."
type: "workflow"
category: "lifecycle"
phase: 5
agent: "ux-designer"
inputs:
  cold_file_reads:
    - "_context/design/brand-guidelines-v{N}.md (the § Tokens section — colour/type/spacing/motion)"
    - ".coldpress/local-config.yaml (active a11y baseline for contrast checks)"
outputs:
  - artifact: "Design tokens (enforcement contract)"
    location: "_context/design/tokens.json"
    format: "json"
    schema: "schemas/design/tokens.schema.ts"
    sacred: false
  - artifact: "Generated token binding"
    location: "_context/design/tokens.css"
    format: "css"
    sacred: false
version: "1.0"
---

## Purpose

`brand-guidelines` decides the tokens as prose; **this skill makes them load-bearing.** It lifts the token section into `tokens.json` — a schema'd, machine-readable contract — and runs `coldpress tokens build` to generate `tokens.css` (CSS custom properties + dark-mode) *from* it. Because the build imports the generated binding, the app can only use token values by construction; `visual-verify` then fails any UI that reaches past them. Detectable divergence becomes impossible divergence.

## When to Use

- After `brand-guidelines` locks the token palette/scale, before Phase 6 architecture (which references the tokens) and Phase 8 implementation (which consumes `tokens.css`).
- Re-run whenever the brand-guidelines token section changes (a design-delta forward-carries the change).

## Prerequisites

- `_context/design/brand-guidelines-v{N}.md` exists with a token section (colour roles, type scale, spacing, optional radii/shadows/motion).

## Process

1. **Lift the tokens** from the brand-guidelines § Tokens section into the `tokens.json` shape (`schemas/design/tokens.schema.ts`): `typography` (families/sizes/weights), `color` (semantic `roles`, each `light` + optional `dark`, optional raw `palette`), `spacing`, and optional `radii`/`shadows`/`breakpoints`/`z_index`/`motion`. Every colour that will be used in the UI must exist here as a role — a value that isn't a token is exactly what `visual-verify` rejects.

2. **Author dark-mode values** for each colour role that the design supports dark for (`roles.<name>.dark`). The styleguide renders both themes; a missing dark value on a used role surfaces at `visual-verify`.

3. **Emit `_context/design/tokens.json`** and validate it (`coldpress tokens build` parses against the schema before generating). A schema failure blocks — fix the tokens, not the generator.

4. **Generate the binding** — `coldpress tokens build` writes `_context/design/tokens.css` (CSS custom properties + `prefers-color-scheme` dark block). This is the file the app imports; the implementation consumes tokens *by construction*.

5. **Contrast check** — verify colour role pairings (text-on-bg, etc.) meet the active a11y baseline's contrast minimum. A failure raises a supersede-check: adjust the token or downgrade the a11y opt-in via a Phase 3 baselines re-entry.

## Output

`_context/design/tokens.json` (the contract) + `_context/design/tokens.css` (the generated binding the build imports). Consumed by `styleguide` (renders them), `visual-verify` (checks usage), and the implementation (imports the CSS).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-04 | Butler (v0.4 WS10-A2) | NEW P5 producer (system-integration audit A2: `tokens.json` consumed by `coldpress tokens build`/`visual-verify`/the F6 design registry/readiness, but no skill wrote it — tokens lived only as a markdown section in brand-guidelines). Lifts the brand-guidelines token section into the schema'd `tokens.json` contract + generates `tokens.css`, closing the producer break for the tokens-build → visual-verify chain. |
