/**
 * Delta record schema — the machine-readable forward-carry quartet (action plan
 * §4.3 / operating model §II.3). Replaces the prose deltas in the quartet docs.
 *
 * Instances: `_context/deltas/DLT-<phase>-<seq>.yaml`. Phase-exit hooks refuse
 * exit while any delta from that phase has `resolution: null`. The silent-
 * divergence guard is a one-line script: every `flag_for_architecture_ADR`
 * delta must have a matching ADR (checked via `coldpress trace`, WS2).
 */

import { z } from "zod";

/**
 * The four reconciliation options (CLAUDE.md Rule 5). `null` = unresolved,
 * which blocks phase exit.
 */
export const DeltaResolutionEnum = z.enum([
  "accept_into_prd",
  "reject",
  "flag_for_architecture_ADR",
  "park_for_phase_11",
]);
export type DeltaResolution = z.infer<typeof DeltaResolutionEnum>;

export const DeltaRecordSchema = z
  .object({
    /** `DLT-<phase>-<seq>` — matches the filename stem. */
    id: z.string().min(1),
    /** Phase the delta surfaced in (1–11, or a lite phase name). */
    origin_phase: z.union([z.number().int().min(1).max(11), z.string()]),
    /** What diverged / what surfaced. */
    description: z.string().min(1),
    /** Who/what it affects downstream. */
    impact: z.string().min(1),
    /** One of the four options, or null while unresolved (blocks phase exit). */
    resolution: DeltaResolutionEnum.nullable(),
    resolved_by: z.string().optional(),
    resolved_at: z.string().optional(),
    /**
     * For `resolution: flag_for_architecture_ADR` — the ADR id/path that
     * resolves this delta. The silent-divergence guard (`coldpress trace
     * orphans`) requires this to point at an existing ADR.
     */
    adr_ref: z.string().optional(),
  })
  .strict()
  .refine((v) => v.resolution === null || !!v.resolved_by, {
    message: "a resolved delta requires resolved_by",
  });

export type DeltaRecord = z.infer<typeof DeltaRecordSchema>;

export function parseDeltaRecord(input: unknown): DeltaRecord {
  return DeltaRecordSchema.parse(input);
}

/** True when the delta still blocks phase exit. */
export function isUnresolved(delta: DeltaRecord): boolean {
  return delta.resolution === null;
}
