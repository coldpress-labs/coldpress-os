---
name: budgets
description: "Author the performance + accessibility budgets (P5) — _context/design/budgets.yaml: Core Web Vitals + transfer-weight + WCAG level + optional Lighthouse floors. The numeric bar the design commits to; P9 readiness enforces it (Lighthouse vs budgets.yaml, G12, block on regression) and the L7 perf layer of testing.yaml reads it."
license: MIT
compatibility: Invoked by @ux-designer in Phase 5
version: "1.0"
---

## Purpose

A design that looks right but loads slowly or fails a screen reader isn't done. `budgets.yaml` is the numeric contract that says so: Core Web Vitals thresholds, transfer-weight ceilings, and the WCAG level. Authored at P5, enforced at P9 — `readiness` runs Lighthouse against it and blocks on regression (G12). It turns "should be fast + accessible" into a gate.

## When to Use

- During Phase 5, alongside `design-tokens` / `styleguide`, once the device/viewport targets are known.
- Re-run when the a11y baseline changes (WCAG level) or an outcome adds a latency target.

## Prerequisites

- `ux-design-spec-v{N}.md` exists (device/viewport targets inform the budgets).
- The active a11y baseline is known (sets the `wcag_level`).

## Process

1. **Set the Core Web Vitals targets** — `performance`: `lcp_ms` (required), plus `inp_ms`, `cls`, `ttfb_ms`, `fcp_ms` as relevant. Anchor to the device class the ux-spec targets (a marketing site on mobile is stricter than an internal tool on desktop). Align any latency target with the matching `outcomes.yaml` outcome so P9 and P10 measure the same number.

2. **Set the transfer-weight ceilings** — `weight`: `js_kb` (required), plus `css_kb`/`image_kb`/`font_kb`/`total_kb`. These are the bundle guardrails the readiness Lighthouse pass checks.

3. **Set the accessibility bar** — `accessibility`: `wcag_level` (A/AA/AAA, from the active a11y baseline) + `axe_max_violations` (default 0 — no regressions).

4. **Optionally set Lighthouse category floors** — `lighthouse`: `performance`/`accessibility`/`best_practices`/`seo` (0–100), the category scores readiness asserts.

5. **Emit `_context/design/budgets.yaml`** (`schemas/design/budgets.schema.ts`) and validate:

   ```yaml
   scope: "marketing-site"
   performance: { lcp_ms: 1800, inp_ms: 200, cls: 0.1, ttfb_ms: 600 }
   weight: { js_kb: 150, css_kb: 40, image_kb: 300, total_kb: 600 }
   accessibility: { wcag_level: "AA", axe_max_violations: 0 }
   lighthouse: { performance: 90, accessibility: 100 }
   ```

## Output

`_context/design/budgets.yaml` — the perf/a11y contract. Enforced by `readiness` (P9, Lighthouse-vs-budgets, G12) and read by the L7 perf layer of `testing.yaml`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-04 | Butler (v0.4 WS10-A2) | NEW P5 producer (system-integration audit A2: `budgets.yaml` consumed by `readiness` G12 + the F6 design registry + testing L7, but no skill wrote it). Authors the CWV + weight + WCAG + Lighthouse-floor budgets, closing the producer break for the P9 Lighthouse-vs-budgets gate. |
