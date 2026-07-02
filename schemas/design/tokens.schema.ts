/**
 * Design tokens schema (action plan §5 P5 / WS4) — the enforcement contract.
 *
 * Instance: `_context/design/tokens.json`. Load-bearing: `tokens-build` generates
 * the code binding (CSS custom properties + framework config) FROM this file, so
 * the build consumes tokens by construction and divergence becomes impossible
 * rather than merely detectable. `visual-verify` then checks *usage*, not values.
 * Schema-validated on write; changes after P5 exit require a delta.
 */

import { z } from "zod";

/** A dimension/size token — a CSS length string or a raw number (px implied). */
const Dimension = z.union([z.string().min(1), z.number()]);

/** A color role: a light value + an optional dark value (semantic theming). */
export const ColorRoleSchema = z.object({
  light: z.string().min(1),
  dark: z.string().min(1).optional(),
});
export type ColorRole = z.infer<typeof ColorRoleSchema>;

export const TokensSchema = z
  .object({
    typography: z.object({
      /** Font families keyed by role, e.g. `{ sans: "Inter, system-ui", mono: "…" }`. */
      families: z.record(z.string(), z.string().min(1)),
      /** Type scale, e.g. `{ xs: "0.75rem", base: "1rem", xl: "1.5rem" }`. */
      sizes: z.record(z.string(), Dimension),
      weights: z.record(z.string(), z.number()).optional(),
      line_heights: z.record(z.string(), Dimension).optional(),
    }),
    color: z.object({
      /** Semantic roles (bg/surface/text/primary/accent/danger/…), each light[+dark]. */
      roles: z.record(z.string(), ColorRoleSchema),
      /** Optional raw palette the roles reference. */
      palette: z.record(z.string(), z.string()).optional(),
    }),
    /** Spacing scale, e.g. `{ 1: "4px", 2: "8px" }`. */
    spacing: z.record(z.string(), Dimension),
    radii: z.record(z.string(), Dimension).optional(),
    shadows: z.record(z.string(), z.string()).optional(),
    breakpoints: z.record(z.string(), Dimension).optional(),
    z_index: z.record(z.string(), z.number()).optional(),
    motion: z
      .object({
        durations: z.record(z.string(), Dimension).optional(),
        easings: z.record(z.string(), z.string()).optional(),
      })
      .optional(),
  })
  .strict();

export type Tokens = z.infer<typeof TokensSchema>;

export function parseTokens(input: unknown): Tokens {
  return TokensSchema.parse(input);
}
