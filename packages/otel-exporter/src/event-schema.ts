/**
 * EventStream JSONL contract — mirrored from @coldpress/core §6.4.
 *
 * This package talks to coldpress-os through the on-disk JSONL protocol,
 * not through an in-process TypeScript import. That's deliberate: the
 * EventStream (`.coldpress/runs/<run-id>/events.jsonl`) is the stable
 * surface; `@coldpress/core` internals are not. Pinning the contract to
 * `schema_version: 1` here means schema evolution in core requires a
 * matching bump here — caught at parse time, never silently.
 *
 * If core bumps the schema, this package opens a new top-level version
 * and keeps the old one callable; consumers pin their exporter to match
 * the coldpress-os version that authored the run.
 */

import { z } from "zod";

const TIMESTAMP = z.string().datetime();
const SEQ = z.number().int().nonnegative();
const RUN_ID = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "run_id must be kebab-case");
const SKILL_ID = z.string().min(1);
const GATE_ID = z.string().min(1);
const WAVE_ID = z.string().min(1);
const PHASE = z.number().int().min(1).max(9);

const BASE = {
  schema_version: z.literal(1),
  seq: SEQ,
  run_id: RUN_ID,
  timestamp: TIMESTAMP,
};

export const WaveStartActionSchema = z.object({
  ...BASE,
  kind: z.literal("wave-start"),
  wave_id: WAVE_ID,
  phase: PHASE,
  label: z.string().optional(),
});

export const WaveEndActionSchema = z.object({
  ...BASE,
  kind: z.literal("wave-end"),
  wave_id: WAVE_ID,
  phase: PHASE,
  status: z.enum(["success", "failure", "interrupted"]),
  duration_ms: z.number().int().nonnegative().optional(),
});

export const SkillInvokeActionSchema = z.object({
  ...BASE,
  kind: z.literal("skill-invoke"),
  skill_id: SKILL_ID,
  caller: z.string().optional(),
  args: z.record(z.string(), z.unknown()).optional(),
});

export const GateEvaluateActionSchema = z.object({
  ...BASE,
  kind: z.literal("gate-evaluate"),
  gate_id: GATE_ID,
  phase: PHASE,
});

export const SkillResultObservationSchema = z.object({
  ...BASE,
  kind: z.literal("skill-result"),
  skill_id: SKILL_ID,
  cause_seq: SEQ.optional(),
  exit_code: z.number().int(),
  duration_ms: z.number().int().nonnegative().optional(),
  artifact_path: z.string().optional(),
  message: z.string().optional(),
});

export const GatePassObservationSchema = z.object({
  ...BASE,
  kind: z.literal("gate-pass"),
  gate_id: GATE_ID,
  phase: PHASE,
  cause_seq: SEQ.optional(),
});

export const GateFailObservationSchema = z.object({
  ...BASE,
  kind: z.literal("gate-fail"),
  gate_id: GATE_ID,
  phase: PHASE,
  cause_seq: SEQ.optional(),
  blockers: z.array(z.string()),
});

export const CondensationSchema = z.object({
  ...BASE,
  kind: z.literal("condensation"),
  wave_id: WAVE_ID,
  summary: z.string().min(1),
  from_seq: SEQ,
  to_seq: SEQ,
});

export const EventSchema = z.discriminatedUnion("kind", [
  WaveStartActionSchema,
  WaveEndActionSchema,
  SkillInvokeActionSchema,
  GateEvaluateActionSchema,
  SkillResultObservationSchema,
  GatePassObservationSchema,
  GateFailObservationSchema,
  CondensationSchema,
]);

export type Event = z.infer<typeof EventSchema>;
export type WaveStartAction = z.infer<typeof WaveStartActionSchema>;
export type WaveEndAction = z.infer<typeof WaveEndActionSchema>;
export type SkillInvokeAction = z.infer<typeof SkillInvokeActionSchema>;
export type GateEvaluateAction = z.infer<typeof GateEvaluateActionSchema>;
export type SkillResultObservation = z.infer<typeof SkillResultObservationSchema>;
export type GatePassObservation = z.infer<typeof GatePassObservationSchema>;
export type GateFailObservation = z.infer<typeof GateFailObservationSchema>;
export type Condensation = z.infer<typeof CondensationSchema>;
