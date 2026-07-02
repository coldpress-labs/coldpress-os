/**
 * `outcomes.yaml` schema (action plan §5 P4 / §7.16) — the outcome contract.
 *
 * Instance: `_context/planning/outcomes.yaml`. Each priority requirement links a
 * measurable target and the source that measures it. This is the framework's
 * definition of success being the product's, not the process's: P6 designs the
 * analytics events that implement it, P9 asserts instrumentation, P10 reports
 * actual-vs-target, P11 retrospects on it.
 *
 * The P4 gate fails if a P0/P1 requirement has no outcome target (see
 * `src/outcomes/coverage.ts`).
 */

import { z } from "zod";

/** Where the metric is measured. */
export const OutcomeSourceSchema = z
  .object({
    type: z.enum([
      "analytics_event",
      "uptime_probe",
      "search_console",
      "revenue_report",
      "cost_report",
      "manual",
    ]),
    /** The concrete reference (event name, probe id, report, …). */
    ref: z.string().min(1),
  })
  .strict();
export type OutcomeSource = z.infer<typeof OutcomeSourceSchema>;

export const OutcomeSchema = z
  .object({
    /** The requirement this outcome measures (keys back to the PRD). */
    requirement_id: z.string().min(1),
    /** Requirement priority — P0/P1 outcomes are mandatory at the P4 gate. */
    priority: z.enum(["P0", "P1", "P2", "P3"]).optional(),
    /** What is measured, e.g. activation_rate, conversion, latency_p95, seo_position, cost_per_run. */
    metric: z.string().min(1),
    /** The target value, e.g. ">= 40%", 1800 (ms), "top 3". */
    target: z.union([z.string(), z.number()]),
    unit: z.string().optional(),
    source: OutcomeSourceSchema,
  })
  .strict();
export type Outcome = z.infer<typeof OutcomeSchema>;

export const OutcomesSchema = z
  .object({
    outcomes: z.array(OutcomeSchema),
  })
  .strict();
export type Outcomes = z.infer<typeof OutcomesSchema>;

export function parseOutcomes(input: unknown): Outcomes {
  return OutcomesSchema.parse(input);
}
