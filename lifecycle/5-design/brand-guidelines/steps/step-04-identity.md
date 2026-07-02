---
step_number: 4
step_name: "Identity + A11y Rules + Finalisation"
step_goal: "Author identity (logo + iconography) + a11y rules; editorial-structure; emit validated-distillate + sidecar"
halts_for_input: true
next_step: null
partial_completion_id: "brand_guidelines_step_04"
conditional: "skip_identity_if scope_mode == tokens-only (still emit a11y rules)"
---

## Goal

Author identity section (logo treatment + iconography style) and a11y rules section. Wire `editorial-structure`. Schema-validate. Emit validated-distillate + sidecar.

## Instructions

### 1. Partial-completion write

`partial_completion: { step_id: "brand_guidelines_step_04", sub_skill: "identity_a11y_finalise", at: "started" }`.

### 2. A11y rules section (always-on, regardless of scope_mode)

Read `baselines.a11y_axis`. Author rules per level:

```
## Accessibility Rules

**Active baseline:** {baseline}

### Contrast minimums (auto-validated in Step 3)
- Normal text: {ratio}:1 — verified in token tables
- Large text: {ratio}:1
- UI components & graphics: 3:1

### Keyboard navigation
- All interactive elements keyboard-reachable (Tab/Shift+Tab)
- Focus visible (token: `--focus-ring` at minimum 3:1 contrast vs surface)
- Escape closes overlays / modals / menus
- Enter/Space activates focused element
- Arrow keys navigate within composite widgets

### Screen reader
- Landmark roles on regions (header / main / nav / footer / aside)
- Heading hierarchy starts at h1 per page; no skipped levels
- Form labels programmatically associated
- Error messages programmatically announced (aria-live)
- Decorative icons aria-hidden; semantic icons get aria-label

### Motion
- {motion_reduce_required ? "MANDATORY" : "RECOMMENDED"} respect for `prefers-reduced-motion`
- Auto-playing motion >5s requires pause control

### Language
{if WCAG-AAA opt-in:}
- Page lang attribute set
- Language-of-parts annotated where multilingual content appears
- Idioms / unusual words have inline glossary or link
```

### 3. Identity — Logo treatment (skip if tokens-only)

Prompt:

> **Logo treatment.**
>
> - Primary lockup (with safe-area / clear-space spec)
> - Variants (full-colour / mono / inverse / icon-only)
> - Minimum sizes per surface
> - Don'ts (3–5 incorrect usages with examples)

### 4. Identity — Iconography (skip if tokens-only)

Prompt:

> **Iconography.**
>
> - Style: outline / filled / duotone / mixed
> - Stroke width (if outline)
> - Corner radius
> - Grid (e.g., 24×24 or 16×16)
> - Recommended icon library (e.g., Lucide / Heroicons / Phosphor) OR custom-only
> - Aria-rules: decorative icons get `aria-hidden="true"`; semantic icons need `aria-label`

If `scope_mode == design-led` or `WDS`: author extended icon library section with 12+ standard icons and their meanings.

### 5. Editorial-prose on identity description

Invoke `editorial-prose` on the identity prose for clarity.

### 6. Editorial-structure on full document

Invoke `editorial-structure` against the full draft. Section ordering, header hierarchy, scannable structure.

### 7. Schema-validate

Run schema validation against `schemas/design/brand-guidelines.schema.json`. Fix or surface failures.

### 8. Write VC panel

Append VC table; v1.0 entry: "Initial brand-guidelines authored Phase 5; scope_mode: {mode}; sources versioned per frontmatter."

### 9. Emit validated-distillate

Move draft to final `_context/design/brand-guidelines-v{N}.md`. Set `status: validated`.

Emit sidecar `brand-guidelines-v{N}.meta.json`:

```json
{
  "schema_version": 1,
  "version": "<N>",
  "validated_at": "<ISO>",
  "scope_mode": "<mode>",
  "sources": { "design_brief": "<v>", "personas": "<v>", "baselines": [...], "tech_stack": "<v>" },
  "tokens_count": { "colour": <N>, "typography": <N>, "spacing": <N>, "motion": <N> },
  "contrast_validation_pairs": <N>,
  "contrast_validation_failures": <N>,
  "advanced_elicitation_invocations": <N>,
  "design_deltas_surfaced": <count>
}
```

### 10. Update graph

Update node `brand-guidelines-v{N}` with version, status, validated_at, scope_mode, source_versions, token_counts.

### 11. Partial-completion clean

`at: "distillate_emitted"`. Clear partial_completion entirely.

## Output

- `_context/design/brand-guidelines-v{N}.md` validated-distillate
- `_context/design/brand-guidelines-v{N}.meta.json` sidecar
- Graph node updated

## Navigation

→ Phase 5 continues with `prototype` (after both `ux-design` and `brand-guidelines` are validated) and/or ad-hoc `skills/creative/storytelling` narrative work.
