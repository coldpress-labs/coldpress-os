/**
 * Orchestration state schema — `.coldpress/state.yaml`, the single source of
 * orchestration truth (operating model §II.1, action plan §4.1).
 *
 * Everything routes off this file. It is written ONLY by Butler and by
 * phase-exit hooks; every other agent has no Write permission to it (enforced
 * by the `sacred-guard`/state PreToolUse hook). Phase advancement is impossible
 * while `gates.p<N-1>` has a false/missing required key (enforced by the
 * `phase-gate` hook, full lane only).
 *
 * Used by:
 *   - The `load-state` SessionStart hook — reads this file and injects a
 *     ~150-token lane/phase/gates/pending-human-gate summary at session start.
 *   - The `phase-gate` PreToolUse(Skill) hook — blocks phase-N skills until
 *     `gates.p(N-1)` required keys are green (full lane).
 *   - The PreToolUse(Edit|Write) state-guard — denies writes to
 *     `.coldpress/state.yaml` from any agent but Butler.
 *   - `coldpress doctor` — state-coherence checks (§7.11).
 *
 * Shape is operating model §II.1 plus the two action-plan §4.1 additions
 * (`security_tier`, `enforcement`) and the §10 phase-geometry `iteration`
 * counter. This schema validates the file's SHAPE; edit-rights and gate
 * sequencing are enforced by hooks, not here.
 */

import { z } from "zod";

/** Ceremony lane. `lite` = 4 consolidated phases (default); `full` = 11 phases. */
export const LaneEnum = z.enum(["lite", "full"]);
export type Lane = z.infer<typeof LaneEnum>;

/** Where the current phase is in its own lifecycle. */
export const PhaseStatusEnum = z.enum([
  "entering",
  "in_progress",
  "gates_pending",
  "complete",
]);
export type PhaseStatus = z.infer<typeof PhaseStatusEnum>;

/**
 * Security tier, set at Phase 1 and read everywhere (action plan §7.3).
 * T0 = brochure/no-auth; T1 = auth/PII; T2 = payments/revenue.
 */
export const SecurityTierEnum = z.enum(["T0", "T1", "T2"]);
export type SecurityTier = z.infer<typeof SecurityTierEnum>;

/**
 * Enforcement mode. `on` = all hooks blocking; `degraded` = documented
 * reduced enforcement (recorded here + surfaced in verifier verdicts, §7.11);
 * `off` = hooks disabled (escape hatch, loudly logged).
 */
export const EnforcementModeEnum = z.enum(["on", "off", "degraded"]);
export type EnforcementMode = z.infer<typeof EnforcementModeEnum>;

/**
 * Current phase. In the full lane this is a phase id 1–11 (operating model
 * §II.1 shows `phase: 8`). In the lite lane it is a named phase
 * (`spec` | `build` | `verify` | `ship`, action plan §6). Both forms are
 * accepted; hooks branch on `lane`.
 */
export const LitePhaseEnum = z.enum(["spec", "build", "verify", "ship"]);
export type LitePhase = z.infer<typeof LitePhaseEnum>;

export const PhaseSchema = z.union([
  z.number().int().min(1).max(11),
  LitePhaseEnum,
]);
export type Phase = z.infer<typeof PhaseSchema>;

/**
 * One phase's gate ledger — an open map of gate-key → value, written by
 * phase-exit hooks. Values are booleans (required-key gates), numbers
 * (progress counters like `stories_done`), or strings (e.g. an `exited`
 * ISO timestamp). Kept permissive on purpose: gate keys are phase-specific
 * and defined by each phase's gate.json, not enumerated here.
 */
export const GateLedgerEntrySchema = z.record(
  z.string(),
  z.union([z.boolean(), z.number(), z.string()]),
);
export type GateLedgerEntry = z.infer<typeof GateLedgerEntrySchema>;

/**
 * Deploy sub-state (operating model §II.1). `pack` is the selected deploy
 * pack; `staging_smoke` / `prod` are null until their smoke runs, then a
 * boolean pass/fail or a status string. Permissive to allow pack-specific
 * extra keys (rollback pointers, preview URLs) added by WS6.
 */
export const DeployStateSchema = z
  .object({
    pack: z.string().nullable().optional(),
    staging_smoke: z.union([z.boolean(), z.string()]).nullable().optional(),
    prod: z.union([z.boolean(), z.string()]).nullable().optional(),
  })
  .passthrough();
export type DeployState = z.infer<typeof DeployStateSchema>;

/**
 * The orchestration state. `.strict()` on the top level so a typo'd key
 * (e.g. `security_teir`) is caught rather than silently ignored — this file
 * is the routing spine and must not drift. Sub-objects stay permissive where
 * their keys are phase/pack-specific.
 */
export const StateSchema = z
  .object({
    /** Ceremony lane. */
    lane: LaneEnum,
    /** Current phase — numeric (full lane) or named (lite lane). */
    phase: PhaseSchema,
    /** Where the current phase sits in its own lifecycle. */
    phase_status: PhaseStatusEnum,
    /** Security tier, set at Phase 1 (§4.1 addition). */
    security_tier: SecurityTierEnum,
    /** Enforcement mode (§4.1 addition). */
    enforcement: EnforcementModeEnum,
    /**
     * Iteration counter for the foundation-pass-then-loop topology
     * (§10 phase geometry). 0 = first pass. Optional — absent means 0.
     */
    iteration: z.number().int().min(0).optional(),
    /**
     * Per-phase gate ledger, keyed `p1`…`p11` (full) or the lite phase
     * name. Written by phase-exit hooks. Empty at project start.
     */
    gates: z.record(z.string(), GateLedgerEntrySchema).default({}),
    /** In-flight story ids (team mode). */
    active_stories: z.array(z.string()).default([]),
    /** Open delta counts per class (e.g. `{design: 0, architecture: 1}`). */
    deltas_open: z.record(z.string(), z.number().int().min(0)).default({}),
    /** Deploy sub-state. */
    deploy: DeployStateSchema.default({}),
  })
  .strict();

export type State = z.infer<typeof StateSchema>;

/**
 * Parse + validate an unknown value (e.g. parsed YAML) as orchestration
 * state. Throws a ZodError with field-level detail on mismatch — the
 * `schema-validate` hook surfaces that back into the loop (exit 2).
 */
export function parseState(input: unknown): State {
  return StateSchema.parse(input);
}
