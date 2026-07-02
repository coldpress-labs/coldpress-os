---
name: a11y-audit
description: WCAG 2.2-graded accessibility audit. Reviews UX spec (Phase 5) + implemented code (Phase 8) against WCAG A/AA/AAA criteria. Conditional in design-led + WDS archetypes; advisory in standard archetype. Surfaces violations + suggested fixes; categorises by impact (Critical / Serious / Moderate / Minor).
license: MIT
compatibility: Invoked by @verifier in Phase 5
version: "1.0"
---

## Purpose

WCAG 2.2 conformance audit at two natural checkpoints: **Phase 5 exit** (audit UX spec + brand-guidelines tokens for design-time a11y violations like contrast failures, missing alt-text plans, keyboard-trap patterns) and **Phase 8 exit** (audit implemented code via lint rules + axe-core integration + manual review of focus management).

Conditional behaviour: required for `design-led` + `WDS` archetypes (block-severity); advisory for `standard` archetype (warn-severity); skipped for `vibe-coder-lean` archetype unless user explicitly invokes.

## When to Use (Proactive Triggers)

1. Phase 5 exit — design-time a11y check before architecture/breakdown commits
2. Phase 8 per-story or per-wave — implemented-code a11y check
3. User says "check accessibility" / "WCAG audit" / "a11y review"
4. Pre-deploy gate (Phase 9 readiness-check sub-step) — final verification
5. Brand-guidelines token change — re-verify contrast ratios

## Output Artifacts

1. **A11y audit report** at `_context/audit/a11y-audit-v{N}.md` — categorised violations by WCAG criterion + impact level (Critical / Serious / Moderate / Minor) + Phase 5 vs Phase 8 origin
2. **Per-violation remediation list** at `_context/audit/a11y-violations-v{N}.json` — structured: each violation has `id`, `wcag_criterion`, `impact`, `location` (file:line OR ux-spec section), `description`, `fix_recommendation`, `status` (open / fixed / accepted-with-rationale)
3. **Contrast-failure flag** for brand-guidelines — if any token-pair fails the configured WCAG level, surface as design-delta (Phase 5 path)
4. **Deploy-gate verdict** — pass / pass-with-warnings / block (only for `design-led` + `WDS` at Phase 9)

## Prerequisites

- `coldpress.yaml` `baselines.a11y` block specifies target conformance level (`A` / `AA` / `AAA`; default `AA`)
- For Phase 5 invocation: `ux-design-spec-v{latest}.md` exists; `brand-guidelines-v{latest}.md` exists with token values
- For Phase 8 invocation: implemented code under `sandbox/` or `live/`; ideally axe-core or pa11y in dev-deps
- Archetype determines severity:
  - `design-led` / `WDS` → block-severity
  - `standard` → warn-severity
  - `vibe-coder-lean` → skipped unless explicitly invoked (then warn-only)

## Process

→ See [workflow.md](workflow.md) for full process.

1. **Step 1 — Read baseline + archetype** to determine conformance level + severity
2. **Step 2 — Phase 5 design-time checks**:
   - Brand tokens contrast ratio (4.5:1 normal text / 3:1 large text / 7:1 AAA)
   - UX spec has alt-text guidelines for images
   - Keyboard navigation patterns documented
   - Focus order specified for complex components
   - Touch target sizes ≥ 24×24px (AA) / 44×44px (AAA)
3. **Step 3 — Phase 8 code-time checks** (if invocation phase=8):
   - Run axe-core or pa11y if available; capture violations
   - Static analysis: aria-* attribute correctness; semantic HTML usage
   - Manual review: focus traps; keyboard-only flows; screen-reader announcements
4. **Step 4 — Categorise violations** by WCAG criterion + impact
5. **Step 5 — Emit audit report + violations JSON**
6. **Step 6 — If Phase 5: surface contrast failures as design-deltas** (target: brand-guidelines re-tokenisation)
7. **Step 7 — Determine gate verdict** based on archetype + open violations

## Activation-Gate Checklist

- [ ] Baseline level + archetype loaded
- [ ] All Phase 5 design-time checks executed (or N/A logged)
- [ ] All Phase 8 code-time checks executed (or N/A logged)
- [ ] Each violation has WCAG criterion + impact + remediation
- [ ] Audit report emitted; violations JSON conforms to schema
- [ ] Phase 5 contrast failures surfaced as design-deltas (forward-carry)
- [ ] If `design-led` / `WDS`: zero Critical violations open before deploy gate

## Output

Audit report + violations JSON in `_context/audit/`. Phase 5 contrast failures forward-carry as design-deltas. Phase 9 deploy gate blocks on Critical violations for `design-led` / `WDS` archetypes.

## WCAG criteria checklist (priority subset)

| Criterion | Level | Phase 5 check | Phase 8 check |
|---|---|---|---|
| 1.1.1 Non-text Content | A | UX spec alt-text plan | `<img alt="">` present |
| 1.4.3 Contrast (Min) | AA | brand tokens 4.5:1 | computed CSS contrast |
| 1.4.6 Contrast (Enhanced) | AAA | brand tokens 7:1 | computed CSS contrast |
| 2.1.1 Keyboard | A | nav patterns | tab order + focus |
| 2.4.3 Focus Order | A | UX spec | DOM order + tabindex |
| 2.5.5 Target Size | AAA | UX spec sizes | element bounding box |
| 3.3.2 Labels or Instructions | A | UX spec | `<label>` for inputs |
| 4.1.2 Name, Role, Value | A | UX spec aria plan | aria-* correctness |

## Source Attribution

Pattern adapted from `alirezarezvani/claude-skills` (MIT) `a11y-audit` and `accessibility-expert` skills. Implementation original to coldpress-os; integrates with Phase 5 brand-guidelines tokens + Phase 8 implemented code + archetype-conditional severity.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U07) | Initial a11y-audit skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT). Phase 5 + Phase 8 dual-invocation. Archetype-conditional severity. |
