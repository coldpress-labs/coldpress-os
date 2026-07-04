/**
 * Styleguide manifest schema (action plan §5 P5 / audit F6) — the machine-readable
 * description of the live `/styleguide` route.
 *
 * Instance: `_context/design/styleguide.yaml`. The styleguide itself is a live
 * route that renders every token role + component in light/dark; this manifest
 * declares what that route covers and where its visual baselines live, so
 * `visual-verify` can diff a story's rendered UI against the styleguide baselines
 * (not just against raw token values). Authored at P5; a change after P5 exit
 * requires a design-delta.
 *
 * Parity with `tokens.schema.ts` / `budgets.schema.ts`: a Zod schema + a
 * `parseStyleguide` entry point, validated by the consuming command
 * (`visual-verify`) rather than by the sacred-doc frontmatter validator.
 */

import { z } from "zod";

/** One styleguide section — a coherent group of components on the route. */
export const StyleguideSectionSchema = z
  .object({
    /** Stable id used as the route anchor, e.g. `buttons` → `/styleguide#buttons`. */
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    title: z.string().min(1),
    /** Components rendered in this section. */
    components: z.array(z.string().min(1)).min(1),
    /** Token roles this section exercises (bg/text/primary/…), for coverage. */
    token_roles: z.array(z.string().min(1)).optional(),
  })
  .strict();
export type StyleguideSection = z.infer<typeof StyleguideSectionSchema>;

/** Visual-baseline configuration — what `visual-verify` diffs against. */
export const VisualBaselinesSchema = z
  .object({
    /** Directory holding the committed baseline screenshots. */
    dir: z.string().min(1),
    /** Themes rendered (a dark theme requires a dark token value per role). */
    themes: z.array(z.enum(["light", "dark"])).min(1).default(["light"]),
    /** Viewport widths (px) baselines are captured at. */
    viewports: z.array(z.number().int().positive()).optional(),
  })
  .strict();
export type VisualBaselines = z.infer<typeof VisualBaselinesSchema>;

export const StyleguideSchema = z
  .object({
    /** The in-app route the styleguide renders at. */
    route: z.string().min(1).default("/styleguide"),
    /** Path to the tokens file the styleguide renders from (single source). */
    tokens_ref: z.string().min(1).default("_context/design/tokens.json"),
    /** The sections the route covers — must be non-empty. */
    sections: z.array(StyleguideSectionSchema).min(1),
    /** Where the visual baselines live + how they're captured. */
    baselines: VisualBaselinesSchema,
  })
  .strict();

export type Styleguide = z.infer<typeof StyleguideSchema>;

export function parseStyleguide(input: unknown): Styleguide {
  return StyleguideSchema.parse(input);
}
