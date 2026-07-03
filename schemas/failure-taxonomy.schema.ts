/**
 * Failure-taxonomy schema (v0.4 WS7, §4.8). Validates
 * `data/failure-taxonomy.yaml` — the controlled vocabulary the evolution loop
 * tags failures with. `coldpress evolve` aggregates these ids into leaderboards;
 * EventStream taxonomy tags + eval results must reference a valid class id.
 */

import { z } from "zod";

export const FailureCategoryEnum = z.enum([
  "targeting",
  "correctness",
  "gate",
  "schema",
  "context",
  "scope",
  "design",
  "estimation",
  "dependency",
  "security",
]);
export type FailureCategory = z.infer<typeof FailureCategoryEnum>;

export const FailureSeverityEnum = z.enum(["critical", "high", "medium", "low"]);

export const FailureClassSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    category: FailureCategoryEnum,
    description: z.string().min(1),
    default_severity: FailureSeverityEnum,
  })
  .strict();
export type FailureClass = z.infer<typeof FailureClassSchema>;

export const FailureTaxonomySchema = z
  .object({
    version: z.literal(1),
    classes: z.array(FailureClassSchema).min(1),
  })
  .strict()
  .refine((t) => new Set(t.classes.map((c) => c.id)).size === t.classes.length, {
    message: "duplicate failure-class id",
    path: ["classes"],
  });
export type FailureTaxonomy = z.infer<typeof FailureTaxonomySchema>;

/** Parse + return the set of valid class ids (for validating taxonomy tags). */
export function taxonomyIds(taxonomy: unknown): Set<string> {
  const parsed = FailureTaxonomySchema.parse(taxonomy);
  return new Set(parsed.classes.map((c) => c.id));
}
