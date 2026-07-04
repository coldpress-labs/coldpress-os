/**
 * Verifier packet + verdict schemas (P8, WS10-A4/A5).
 *
 * The system-integration audit (A5) found the clean-room verifier had no
 * machine-readable dispatch or output: "verifier on opus for security stories"
 * was prose, nothing set `to.model`, and verdicts were prose with no schema or
 * record path. (A4) taxonomy tags never reached the EventStream, so evolve's
 * failure leaderboard was always empty.
 *
 * These two schemas + the `coldpress verdict record` command (which appends a
 * `verdict` EventStream event carrying `taxonomy_tags`) close both: the packet
 * mechanizes verifier-on-opus, the verdict record is schema'd + traceable, and
 * recording it turns the failure leaderboard live.
 */

import { z } from "zod";

export const ModelEnum = z.enum(["opus", "sonnet", "haiku"]);
export type Model = z.infer<typeof ModelEnum>;

/**
 * The handoff packet Butler dispatches TO the verifier. Structurally independent
 * by construction: it carries the spec + acceptance + diff to check against, and
 * NOT the developer's reasoning. `to.model` is opus for `risk: high` / security-
 * registry stories (mechanizes the prose "verifier on opus for security").
 */
export const VerifierPacketSchema = z
  .object({
    schema_version: z.literal(1),
    story_id: z.string().min(1),
    to: z.object({
      agent: z.literal("verifier"),
      /** opus for risk:high / security-registry stories; sonnet otherwise. */
      model: ModelEnum,
    }),
    /** True when the story is risk:high (forces to.model = opus). */
    security: z.boolean().default(false),
    /** What the verifier checks against — the spec, not the dev's reasoning. */
    spec_ref: z.string().min(1),
    acceptance_ref: z.string().min(1),
    diff_ref: z.string().min(1),
    /** The packet's owns globs — the diff must stay inside these. */
    owns: z.array(z.string()).default([]),
  })
  .strict()
  // Mechanized verifier-on-opus (A3/A4): a security story must be verified on opus.
  .refine((p) => !p.security || p.to.model === "opus", {
    message: "a security (risk:high) story must set to.model = opus",
    path: ["to", "model"],
  });
export type VerifierPacket = z.infer<typeof VerifierPacketSchema>;

/** One verifier finding. */
export const VerifierFindingSchema = z
  .object({
    kind: z.enum(["spec-mismatch", "gamed-assertion", "out-of-scope-diff", "off-token-ui", "missing-coverage", "other"]),
    detail: z.string().min(1),
    /** The failure-taxonomy class id this finding maps to (data/failure-taxonomy.yaml). */
    taxonomy_tag: z.string().optional(),
  })
  .strict();
export type VerifierFinding = z.infer<typeof VerifierFindingSchema>;

/**
 * The verifier's verdict record. Instance:
 * `_context/audit/verdicts/{story_id}-verdict.yaml`. `coldpress verdict record`
 * validates it + appends a `verdict` EventStream event carrying `taxonomy_tags`
 * (the union of the findings' tags) so `coldpress evolve` counts the failure
 * classes — turning the failure leaderboard live.
 */
export const VerifierVerdictSchema = z
  .object({
    schema_version: z.literal(1),
    story_id: z.string().min(1),
    /** The model that verified (opus for security stories). */
    model: ModelEnum,
    verdict: z.enum(["pass", "fail"]),
    findings: z.array(VerifierFindingSchema).default([]),
    /** Failure-taxonomy class ids (feeds evolve's failure leaderboard). */
    taxonomy_tags: z.array(z.string()).default([]),
  })
  .strict()
  // A fail with no explanation is not actionable; a pass with findings is a contradiction.
  .refine((v) => v.verdict !== "fail" || v.findings.length > 0, {
    message: "a fail verdict must record at least one finding",
    path: ["findings"],
  });
export type VerifierVerdict = z.infer<typeof VerifierVerdictSchema>;

export function parseVerifierVerdict(input: unknown): VerifierVerdict {
  return VerifierVerdictSchema.parse(input);
}
