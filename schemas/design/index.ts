/**
 * Design-system schema registry (audit F6).
 *
 * The design system's DATA artefacts are YAML/JSON (not markdown-with-frontmatter),
 * so they validate via a Zod parser at their consuming command rather than via the
 * sacred-doc frontmatter validator (`src/governance/validate-schema.ts`, which
 * still owns the markdown design *docs*: brand-guidelines, ux-design-spec, …). This
 * index is the single place those data-file schemas are registered — a canonical
 * path pattern → parser map that `tokens-build` / `visual-verify` / `readiness`
 * resolve against, so a design artefact can no longer ship schema-less.
 */

import { z } from "zod";
import { BudgetsSchema, parseBudgets } from "./budgets.schema.js";
import { StyleguideSchema, parseStyleguide } from "./styleguide.schema.js";
import { parseTokens, TokensSchema } from "./tokens.schema.js";

export { BudgetsSchema, parseBudgets } from "./budgets.schema.js";
export { StyleguideSchema, parseStyleguide } from "./styleguide.schema.js";
export { parseTokens, TokensSchema } from "./tokens.schema.js";

/** A registered design data-artefact: how to locate it and how to validate it. */
export interface DesignArtefactSchema {
  /** Canonical instance path under a project. */
  path: string;
  /** Regex matching that instance path (for the validator to route by). */
  pattern: RegExp;
  /** Zod schema for the artefact. */
  schema: z.ZodTypeAny;
  /** Throwing parser (validates + returns the typed value). */
  parse: (input: unknown) => unknown;
}

/** The design data-file schema registry — one entry per validated artefact. */
export const DESIGN_ARTEFACT_SCHEMAS: Record<string, DesignArtefactSchema> = {
  tokens: {
    path: "_context/design/tokens.json",
    pattern: /_context[\\/]design[\\/]tokens\.json$/,
    schema: TokensSchema,
    parse: parseTokens,
  },
  budgets: {
    path: "_context/design/budgets.yaml",
    pattern: /_context[\\/]design[\\/]budgets\.ya?ml$/,
    schema: BudgetsSchema,
    parse: parseBudgets,
  },
  styleguide: {
    path: "_context/design/styleguide.yaml",
    pattern: /_context[\\/]design[\\/]styleguide\.ya?ml$/,
    schema: StyleguideSchema,
    parse: parseStyleguide,
  },
};

/** Resolve the design schema registered for an instance path, if any. */
export function designSchemaForPath(path: string): DesignArtefactSchema | undefined {
  return Object.values(DESIGN_ARTEFACT_SCHEMAS).find((s) => s.pattern.test(path));
}
