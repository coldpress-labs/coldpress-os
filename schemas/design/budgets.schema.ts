/**
 * Performance + a11y budgets schema (action plan §5 P5 / audit F6) — the
 * design-system's numeric contract.
 *
 * Instance: `_context/design/budgets.yaml`. Authored at P5 (Design); enforced at
 * P9 by `readiness` ("Lighthouse vs budgets.yaml", G12) and available to the L7
 * perf layer of `testing.yaml`. Schema-validated on write; changes after P5 exit
 * require a design-delta.
 *
 * Parity with `tokens.schema.ts`: a Zod schema + a `parseBudgets` entry point,
 * validated by the consuming commands (readiness / visual-verify) rather than by
 * the sacred-doc frontmatter validator (budgets.yaml is data, not a markdown doc).
 */

import { z } from "zod";

/** A millisecond threshold — a Core Web Vitals timing budget. */
const Millis = z.number().positive();
/** A kilobyte transfer-weight budget. */
const Kilobytes = z.number().positive();
/** A Lighthouse category score floor (0–100). */
const Score = z.number().min(0).max(100);

/** Core Web Vitals + supporting timings (the "block on regression" targets). */
export const PerformanceBudgetSchema = z
  .object({
    /** Largest Contentful Paint (ms). */
    lcp_ms: Millis,
    /** Interaction to Next Paint (ms). */
    inp_ms: Millis.optional(),
    /** Cumulative Layout Shift (unitless, 0–1+). */
    cls: z.number().min(0),
    /** Time to First Byte (ms). */
    ttfb_ms: Millis.optional(),
    /** First Contentful Paint (ms). */
    fcp_ms: Millis.optional(),
  })
  .strict();
export type PerformanceBudget = z.infer<typeof PerformanceBudgetSchema>;

/** Transfer-weight budgets (uncompressed unless noted) — the bundle guardrails. */
export const WeightBudgetSchema = z
  .object({
    js_kb: Kilobytes,
    css_kb: Kilobytes.optional(),
    image_kb: Kilobytes.optional(),
    font_kb: Kilobytes.optional(),
    /** Total page transfer weight ceiling. */
    total_kb: Kilobytes.optional(),
  })
  .strict();
export type WeightBudget = z.infer<typeof WeightBudgetSchema>;

/** Accessibility budget — the a11y axis's numeric bar. */
export const AccessibilityBudgetSchema = z
  .object({
    /** WCAG conformance target the design commits to. */
    wcag_level: z.enum(["A", "AA", "AAA"]),
    /** Maximum axe violations tolerated (default 0 — no regressions). */
    axe_max_violations: z.number().int().min(0).default(0),
  })
  .strict();
export type AccessibilityBudget = z.infer<typeof AccessibilityBudgetSchema>;

/** Optional Lighthouse category floors (0–100). */
export const LighthouseBudgetSchema = z
  .object({
    performance: Score.optional(),
    accessibility: Score.optional(),
    best_practices: Score.optional(),
    seo: Score.optional(),
  })
  .strict();
export type LighthouseBudget = z.infer<typeof LighthouseBudgetSchema>;

export const BudgetsSchema = z
  .object({
    /** Which project / route this budget set governs (informational). */
    scope: z.string().optional(),
    performance: PerformanceBudgetSchema,
    weight: WeightBudgetSchema,
    accessibility: AccessibilityBudgetSchema,
    /** Optional Lighthouse category floors the readiness gate asserts. */
    lighthouse: LighthouseBudgetSchema.optional(),
  })
  .strict();

export type Budgets = z.infer<typeof BudgetsSchema>;

export function parseBudgets(input: unknown): Budgets {
  return BudgetsSchema.parse(input);
}
