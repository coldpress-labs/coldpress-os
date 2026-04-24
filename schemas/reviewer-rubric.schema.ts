/**
 * @reviewer subagent output schema (§6.2).
 *
 * The reviewer is a pure critic. It reads an artefact + its criteria
 * source, emits a row-per-criterion rubric, and aggregates to a single
 * `pass` / `warn` / `fail` verdict. The rubric lands at
 * `_context/audit/reviews/<artefact-basename>-review-{YYYYMMDD}.json`.
 *
 * Aggregation rule:
 *   - `pass` — every criterion `status: pass`
 *   - `fail` — at least one `status: fail` AND `severity: high`
 *   - `warn` — otherwise (some failures but none `high`)
 */

import { z } from "zod";

export const RubricSeverityEnum = z.enum(["low", "medium", "high"]);
export type RubricSeverity = z.infer<typeof RubricSeverityEnum>;

export const RubricStatusEnum = z.enum(["pass", "fail"]);
export type RubricStatus = z.infer<typeof RubricStatusEnum>;

export const RubricVerdictEnum = z.enum(["pass", "warn", "fail"]);
export type RubricVerdict = z.infer<typeof RubricVerdictEnum>;

export const RubricRowSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "row id must be a kebab-case slug"),
  description: z.string().min(1),
  status: RubricStatusEnum,
  severity: RubricSeverityEnum,
  /**
   * Quote or line reference from the ARTEFACT under review. Must not
   * source from external knowledge; must not source from the criteria
   * file. Pure grounding.
   */
  evidence: z.string().min(1),
  /**
   * One-sentence action if `status === fail`; empty string if
   * `status === pass`. Reviewer does NOT propose rewrites — that's the
   * producer's job. `remediation` identifies the gap, not its fix.
   */
  remediation: z.string(),
});

export type RubricRow = z.infer<typeof RubricRowSchema>;

export const ReviewRubricSchema = z
  .object({
    schema_version: z.literal(1),
    reviewer_version: z.string().min(1),
    artefact_path: z.string().min(1),
    criteria_source: z.string().min(1),
    reviewed_at: z.string().datetime(),
    overall: RubricVerdictEnum,
    criteria: z.array(RubricRowSchema).min(1),
    notes: z.string().optional(),
  })
  .superRefine((r, ctx) => {
    const computed = computeOverall(r.criteria);
    if (r.overall !== computed) {
      ctx.addIssue({
        code: "custom",
        path: ["overall"],
        message: `overall verdict "${r.overall}" disagrees with computed verdict "${computed}"`,
      });
    }
  });

export type ReviewRubric = z.infer<typeof ReviewRubricSchema>;

/**
 * Aggregate criterion rows into an overall verdict. Exported so the
 * reviewer runtime doesn't have to duplicate the logic — keeps
 * schema + computation in one place.
 */
export function computeOverall(criteria: RubricRow[]): RubricVerdict {
  let hasAnyFail = false;
  let hasHighFail = false;
  for (const row of criteria) {
    if (row.status === "fail") {
      hasAnyFail = true;
      if (row.severity === "high") hasHighFail = true;
    }
  }
  if (hasHighFail) return "fail";
  if (hasAnyFail) return "warn";
  return "pass";
}
