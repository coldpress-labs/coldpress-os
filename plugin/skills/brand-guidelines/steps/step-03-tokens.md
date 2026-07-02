---
step_number: 3
step_name: "Tokens (colour/type/spacing/motion) + a11y baseline auto-validation"
step_goal: "Author tokens; auto-validate against active a11y baseline contrast minimums; raise supersede-check on failures"
halts_for_input: true
next_step: "step-04-identity.md"
partial_completion_id: "brand_guidelines_step_03"
---

## Goal

Author the design tokens — colour palette, typography pairs, spacing scale, motion principles. Auto-validate colour pairs against active a11y baseline contrast minimums. Raise supersede-check on failures.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "brand_guidelines_step_03", sub_skill: "tokens", at: "started" }`.

### 2. Read foundational token feel from design-brief

From design-brief Section "Visual Direction": colour family (warm/cool/neutral/vibrant), typography pair concept, spacing concept, motion concept.

### 3. Colour palette authoring

Prompt:

> **Colour palette.** Direction: {colour_family}. Author the system:
>
> - Primary (1 colour + tonal variants 50–900)
> - Secondary (1 colour + tonal variants if needed)
> - Neutral (greyscale ramp)
> - Semantic: success / warning / error / info
> - Surface / background / text-on-light / text-on-dark
>
> Tier-1: `brainstorming` (round_robin, scamper) for palette alternatives.
> Tier-1: `advanced-elicitation` on vague descriptions.

User authors specific values (hex / hsl / display-p3).

### 4. A11y contrast auto-validation

For each text-on-surface combination in the palette, calculate WCAG contrast ratio. Compare against `baselines.a11y_axis`:

| baseline | normal text | large text |
|----------|-------------|-----------|
| WCAG-AA | 4.5:1 | 3:1 |
| WCAG-AAA | 7:1 | 4.5:1 |

For each failing pair: surface as supersede-check failure. Options to user:
- Adjust colour values to pass (recommended)
- Mark pair as "decorative-only / not-for-text" with usage guidance
- Downgrade a11y opt-in via Phase 3 baselines re-entry (heavy hammer; surfaces design-delta)

### 5. Typography authoring

Prompt:

> **Typography.** Direction: {type_pair_concept}.
>
> - Heading face (font-family + weights + style)
> - Body face (font-family + weights + style)
> - Mono face (for code; if relevant)
> - Type scale (h1-h6 + body sizes; modular scale ratio)
> - Line-height per size
> - Letter-spacing adjustments
>
> Tech-stack feasibility: confirm web-font loading strategy (variable fonts vs static; subset vs full).

### 6. Spacing scale authoring

> **Spacing.** Direction: {spacing_concept}.
>
> Choose base unit (typically 4 or 8px). Generate scale: xs/sm/md/lg/xl/2xl etc. Define vertical rhythm convention.

### 7. Motion principles

> **Motion.**
>
> - Duration scale: instant / quick / normal / slow (with values)
> - Easing curves: linear / ease-in / ease-out / spring (with values)
> - Motion-reduce respect: REQUIRED if a11y-AAA opt-in; RECOMMENDED otherwise

If `baselines.motion_reduce_optin == true`, motion-reduce media query MUST be honoured by all motion tokens.

### 8. Token format check (tech-stack feasibility)

From `tech-stack.css_strategy`:
- CSS-in-JS: tokens as JS theme object (e.g., emotion / styled-components)
- Tailwind: tokens as `tailwind.config.js` extensions
- CSS modules / vanilla: tokens as CSS custom properties (`--color-primary` etc.)

Output token tables in the chosen format.

### 9. Write into draft document

Append `## Design Tokens` section with subsections (Colour, Typography, Spacing, Motion). Include tech-stack-conformant format.

### 10. Partial-completion clean

`at: "tokens_drafted_validated"`.

## Output

- Tokens drafted (colour, typography, spacing, motion)
- A11y contrast validated; failures resolved or surfaced as deltas
- Tech-stack-conformant format

## Navigation

→ Next: [step-04-identity.md](step-04-identity.md)
