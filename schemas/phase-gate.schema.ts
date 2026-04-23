/**
 * Phase-gate schema — machine-readable contract for phase exit criteria.
 *
 * Before this schema existed, phase exit criteria were prose in each
 * phase's README ("user feels confident the PRD is complete"). Prose is
 * unverifiable at scale — different subagents and humans interpret it
 * differently. This schema replaces that prose with a structured
 * contract that the `evaluate-phase-gate` skill can mechanically
 * evaluate.
 *
 * Used by:
 *   - `lifecycle/<phase>/gate.json` — one per phase, validates against
 *     this schema on load.
 *   - `skills/governance/evaluate-phase-gate/` — reads gate.json, runs
 *     automated checks, reports human-check pending state, emits
 *     aggregated pass/fail.
 *   - Phase 7 security stack (§5.1), LLM gates (§5.5–§5.7) — each
 *     security scanner's result is one `acceptance_check` inside
 *     Phase 7's gate.json.
 *
 * See `docs/phase-gate-protocol.md` for the user-facing spec.
 */

import { z } from "zod";

export const GateSeverityEnum = z.enum(["block", "warn", "info"]);
export type GateSeverity = z.infer<typeof GateSeverityEnum>;

export const GateCheckKindEnum = z.enum([
  "automated",        // a skill runs, returns pass/fail
  "human",            // a named approver must sign off
  "artefact-present", // a file at a specific path must exist and parse
]);
export type GateCheckKind = z.infer<typeof GateCheckKindEnum>;

/**
 * A single acceptance check within a phase gate. The `kind` discriminator
 * determines which optional fields matter:
 *   - `automated` — `skill_ref` is required (which skill evaluates this)
 *   - `human` — `human_approver` is required (who signs off)
 *   - `artefact-present` — `artefact_path` is required (relative to project root)
 */
export const AcceptanceCheckSchema = z
  .object({
    /** Stable identifier — used in phase-transition audit logs. */
    id: z.string().min(1),
    /** Short human-readable description of what this check verifies. */
    description: z.string().min(5),
    /** What kind of check — determines which fields below are consumed. */
    kind: GateCheckKindEnum,
    /**
     * Severity of a FAIL result. `block` = phase transition refused.
     * `warn` = user sign-off required before proceeding. `info` =
     * logged, does not affect pass/fail.
     */
    severity: GateSeverityEnum,
    /** For kind=automated: which skill id to invoke for evaluation. */
    skill_ref: z.string().optional(),
    /** For kind=human: the named approver or role expected to sign off. */
    human_approver: z.string().optional(),
    /** For kind=artefact-present: project-relative path that must exist. */
    artefact_path: z.string().optional(),
    /**
     * Remediation hint shown to the user on fail. Keep actionable —
     * ideally a specific command or file reference.
     */
    remediation: z.string().optional(),
  })
  .refine(
    (v) => v.kind !== "automated" || !!v.skill_ref,
    { message: "kind=automated requires skill_ref" },
  )
  .refine(
    (v) => v.kind !== "human" || !!v.human_approver,
    { message: "kind=human requires human_approver" },
  )
  .refine(
    (v) => v.kind !== "artefact-present" || !!v.artefact_path,
    { message: "kind=artefact-present requires artefact_path" },
  );

export type AcceptanceCheck = z.infer<typeof AcceptanceCheckSchema>;

/**
 * A phase gate. One gate per phase; defines every acceptance check that
 * must pass before the phase transition emits a clean exit signal.
 */
export const PhaseGateSchema = z.object({
  /** Gate schema version. Breaking changes bump the literal. */
  schema_version: z.literal(1),
  /** Stable gate id — `phase-N-exit`. */
  gate_id: z.string().min(1),
  /** Phase number (1-9). */
  phase: z.number().int().min(1).max(9),
  /** Human-readable phase name — cross-check against phase README frontmatter. */
  phase_name: z.string().min(1),
  /**
   * Entry conditions are prose for now. Could be promoted to structured
   * `acceptance_check` shape in a future schema version when there's
   * demand for machine-checkable phase-entry gates.
   */
  entry_conditions: z.array(z.string().min(5)).min(1),
  /**
   * The ordered list of acceptance checks. Order only matters for
   * presentation in the gate-evaluator's output; evaluation itself is
   * unordered and independent.
   */
  acceptance_checks: z.array(AcceptanceCheckSchema).min(1),
  /** Where to go next on successful exit. */
  next_phase: z.string().min(1),
});

export type PhaseGate = z.infer<typeof PhaseGateSchema>;

/**
 * Result of running a gate evaluation. Emitted by the
 * `evaluate-phase-gate` skill; consumed by the orchestrator at
 * phase-transition time.
 */
export const GateCheckResultSchema = z.object({
  id: z.string(),
  status: z.enum(["pass", "fail", "pending-human", "skip"]),
  /** Short report message shown to the user. */
  message: z.string().optional(),
  /** When severity=warn and status=fail, require explicit user sign-off. */
  requires_sign_off: z.boolean().optional(),
});
export type GateCheckResult = z.infer<typeof GateCheckResultSchema>;

export const GateEvaluationSchema = z.object({
  gate_id: z.string(),
  phase: z.number().int(),
  evaluated_at: z.string().datetime(),
  overall: z.enum(["pass", "fail", "pending-human"]),
  results: z.array(GateCheckResultSchema),
  /** Block-severity failures that halted evaluation. */
  blockers: z.array(z.string()),
  /** Warn-severity failures — need user sign-off. */
  warnings: z.array(z.string()),
});
export type GateEvaluation = z.infer<typeof GateEvaluationSchema>;
