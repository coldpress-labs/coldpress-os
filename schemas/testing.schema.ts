/**
 * `testing.yaml` schema (action plan §7.2 / G2) — the test architecture per stack
 * pack. Declares which of the L0–L7 layers are active, their thresholds, the
 * pyramid shape, the fixtures convention, and flake-quarantine limits. The
 * quality-gate + verifier read this to know what to run and to what bar.
 *
 * Layers (§5 P8):
 *   L0 static (every edit) · L1 unit · L2 component-vs-tokens · L3 integration ·
 *   L4 e2e · L5 visual · L6 a11y · L7 perf (budgets.yaml).
 */

import { z } from "zod";

export const TestLayerEnum = z.enum(["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"]);
export type TestLayer = z.infer<typeof TestLayerEnum>;

/** One test layer's config. */
export const TestLayerConfigSchema = z
  .object({
    enabled: z.boolean().default(true),
    /** Tools that run this layer (vitest, playwright, axe, lighthouse, …). */
    tools: z.array(z.string()).optional(),
    /**
     * Layer-appropriate threshold: a coverage % (L1), a budget (L7 "LCP<1.8s"),
     * etc. Free-form because it is layer-specific.
     */
    threshold: z.union([z.number(), z.string()]).optional(),
  })
  .strict();
export type TestLayerConfig = z.infer<typeof TestLayerConfigSchema>;

export const TestingSchema = z
  .object({
    /** Which stack pack this testing shape belongs to. */
    stack_pack: z.string().optional(),
    /** The active layers + their config, keyed L0–L7 (partial — only active layers). */
    layers: z
      .record(z.string(), TestLayerConfigSchema)
      .refine((obj) => Object.keys(obj).every((k) => (TestLayerEnum.options as readonly string[]).includes(k)), {
        message: "layer keys must be one of L0..L7",
      }),
    /** Pyramid shape hint, e.g. "unit-heavy". */
    pyramid: z.object({ shape: z.string() }).partial().optional(),
    /** Coverage as a smell detector — a default line % + per-path overrides. */
    coverage: z
      .object({
        default_lines_pct: z.number().min(0).max(100).default(70),
        paths: z.record(z.string(), z.number().min(0).max(100)).optional(),
      })
      .optional(),
    /** Fixtures convention (§P8): factories, deterministic seeds, NO production data. */
    fixtures: z
      .object({
        factories: z.boolean().optional(),
        deterministic_seeds: z.boolean().optional(),
        no_production_data: z.boolean().default(true),
      })
      .optional(),
    /** Flake quarantine: tagged tests still run but don't gate; capped per project. */
    flake_quarantine: z.object({ max_quarantined: z.number().int().min(0).default(2) }).optional(),
  })
  .strict();

export type Testing = z.infer<typeof TestingSchema>;

export function parseTesting(input: unknown): Testing {
  return TestingSchema.parse(input);
}
