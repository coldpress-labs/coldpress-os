/**
 * `<NEED_INFO>` message-type schema (§5.4).
 *
 * Ports ChatDev's Communicative Dehallucination protocol as a first-class
 * orchestrator message type. When a subagent hits an ambiguous or missing
 * input, it emits `<NEED_INFO>{question}</NEED_INFO>` instead of
 * hallucinating forward. The orchestrator routes the question to an
 * upstream owner (or human) and pauses the downstream subagent until
 * resolution.
 *
 * Surface:
 *   - In text, `<NEED_INFO>{question}</NEED_INFO>` — what subagents emit.
 *   - In structured form, `NeedInfoMessageSchema` — what the orchestrator
 *     parses + dispatches on.
 *   - In state, `NeedInfoBudgetSchema` — per-topic retry counter so a
 *     runaway back-and-forth escalates to human instead of spinning.
 *
 * Routing is in `orchestrator/engine/need-info-routing.md`; parser +
 * retry-budget runtime in `src/need-info/`.
 */

import { z } from "zod";

/**
 * Canonical uncertainty kinds. The routing table maps each to the likely
 * upstream owner (subagent holding the sacred doc / decision record that
 * would resolve the question).
 *
 * Free-form `other` exists for true outliers — routing falls through to
 * the human gate in that case.
 */
export const NeedInfoKindEnum = z.enum([
  "prd-ambiguity",
  "architecture-unclear",
  "tech-stack-unclear",
  "scope-boundary-unclear",
  "acceptance-criteria-unclear",
  "design-intent-unclear",
  "process-step-unclear",
  "credential-missing",
  "handoff-shape-unclear",
  "other",
]);

export type NeedInfoKind = z.infer<typeof NeedInfoKindEnum>;

/**
 * A single NEED_INFO emission. `from_agent` is the subagent that emitted
 * it; `topic` is a stable slug the budget can count against. `kind`
 * drives routing. `context_refs` are repo-relative paths the orchestrator
 * hands to the upstream owner as the question's anchor.
 */
export const NeedInfoMessageSchema = z.object({
  schema_version: z.literal(1),
  id: z.string().min(1),
  from_agent: z.string().min(1),
  topic: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9][a-z0-9-]*$/,
      "topic must be a kebab-case slug for retry-budget bookkeeping",
    ),
  kind: NeedInfoKindEnum,
  question: z.string().min(1),
  context_refs: z.array(z.string()).default([]),
  emitted_at: z.string().datetime(),
});

export type NeedInfoMessage = z.infer<typeof NeedInfoMessageSchema>;

/**
 * Resolution record written when a human or upstream agent answers a
 * NEED_INFO. Closes the loop so the budget can be freed and the
 * downstream agent can resume.
 */
export const NeedInfoResolutionSchema = z.object({
  schema_version: z.literal(1),
  message_id: z.string().min(1),
  resolved_by: z.string().min(1),
  resolution: z.enum(["answered", "escalated-to-human", "abandoned"]),
  answer: z.string().optional(),
  resolved_at: z.string().datetime(),
});

export type NeedInfoResolution = z.infer<typeof NeedInfoResolutionSchema>;

/**
 * Per-topic retry budget. `spent` increments each time a NEED_INFO is
 * emitted on the same `topic` before resolution; when `spent >= limit`
 * the orchestrator MUST escalate to the human instead of dispatching
 * another round-trip.
 */
export const NeedInfoBudgetSchema = z.object({
  schema_version: z.literal(1),
  topic: z.string().min(1),
  limit: z.number().int().positive().default(3),
  spent: z.number().int().nonnegative().default(0),
  last_message_id: z.string().optional(),
});

export type NeedInfoBudget = z.infer<typeof NeedInfoBudgetSchema>;

/** Default bounded retry budget per the plan (§5.4). */
export const DEFAULT_RETRY_BUDGET = 3;
