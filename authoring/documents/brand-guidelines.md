---
schema: schemas/design/brand-guidelines.schema.json
phase: 5
version: 1
scope_mode: standard
sources:
  design_brief: design-brief-v1
  personas: personas-v1
  baselines: [a11y]
  tech_stack: tech-stack-v1
created_at: <ISO timestamp>
status: draft
distillate: true
sacred: false
---

# Brand Guidelines

> **Authoring template.** Filled in by `brand-guidelines` skill (Phase 5). Validated-distillate; regeneratable from design-brief + personas + baselines + tech-stack. NOT sacred.

## 1. Voice + Tone

### 1.1 Voice traits

| Trait | Definition | Sample (formal) | Sample (casual) | Sample (error/empty) |
|-------|------------|-----------------|-----------------|----------------------|
| <trait-1> | | | | |
| <trait-2> | | | | |
| <trait-3> | | | | |

### 1.2 Tone variations

| Context | Voice trait emphasis | Notes |
|---------|---------------------|-------|
| Onboarding | | |
| Errors | | |
| Success | | |
| Empty states | | |
| Help / docs | | |

## 2. Design Tokens

### 2.1 Colour palette

| Token | Value | Usage | Contrast vs surface |
|-------|-------|-------|---------------------|
| --color-primary | | | |
| --color-primary-50 | | | |
| --color-primary-500 | | | |
| --color-primary-900 | | | |
| --color-secondary | | | |
| --color-success | | | |
| --color-warning | | | |
| --color-error | | | |
| --color-info | | | |
| --color-surface | | | n/a |
| --color-text-on-light | | | |
| --color-text-on-dark | | | |

### 2.2 Typography

| Token | Value | Usage |
|-------|-------|-------|
| --font-heading | | |
| --font-body | | |
| --font-mono | | |
| --type-h1 | | |
| --type-h2 | | |
| --type-body | | |
| --type-small | | |

### 2.3 Spacing

Base unit: <4 or 8>px. Vertical-rhythm convention: <description>.

| Token | Value |
|-------|-------|
| --space-xs | |
| --space-sm | |
| --space-md | |
| --space-lg | |
| --space-xl | |
| --space-2xl | |

### 2.4 Motion

Motion-reduce respect: <REQUIRED / RECOMMENDED>

| Token | Value | Usage |
|-------|-------|-------|
| --duration-instant | | |
| --duration-quick | | |
| --duration-normal | | |
| --duration-slow | | |
| --easing-ease-out | | |
| --easing-ease-in-out | | |
| --easing-spring | | |

## 3. Accessibility Rules

**Active baseline:** <WCAG-AA / WCAG-AAA>

### 3.1 Contrast minimums (auto-validated by `brand-guidelines` Step 3)

- Normal text: <ratio>:1
- Large text: <ratio>:1
- UI components & graphics: 3:1

### 3.2 Keyboard navigation

- (per `brand-guidelines` Step 4 default rules; customise as needed)

### 3.3 Screen reader

- (per default; customise)

### 3.4 Motion

- (motion-reduce respect per baseline)

### 3.5 Language

- (WCAG-AAA opt-in only)

## 4. Identity (skip if scope_mode == tokens-only)

### 4.1 Logo

- Primary lockup: <description / asset path>
- Safe area: <spec>
- Variants: <full-colour / mono / inverse / icon-only>
- Minimum sizes: <per surface>
- Don'ts: <3-5 examples>

### 4.2 Iconography

- Style: <outline / filled / duotone / mixed>
- Stroke width: <if outline>
- Corner radius: <value>
- Grid: <e.g., 24×24>
- Library: <Lucide / Heroicons / Phosphor / custom>
- Aria-rules: decorative `aria-hidden="true"`; semantic `aria-label="<purpose>"`

### 4.3 Extended icon library (scope_mode: design-led / WDS only)

(12+ standard icons with meanings)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | <date> | <author> | Initial brand-guidelines authored Phase 5; scope_mode: <mode>. |
