/**
 * Acceptance record (v0.4 WS6-E, §5 P9 client-acceptance / UAT).
 *
 * The artifact that protects the studio when scope arguments start later:
 * who approved, what scope, when. Written before the production trigger for
 * client projects; the `deploy-gate` hook blocks `deploy-prod` when
 * `state.deploy.requires_acceptance` is set and no record exists under
 * `_context/operations/acceptance/`.
 *
 * Feedback captured during the staging UAT window is triaged here: `bug`
 * items BLOCK production (must be fixed first); `change-request` items become
 * deltas/stories for the next cycle (they do NOT block this release).
 *
 * Instance: `_context/operations/acceptance/ACC-<seq>.yaml`.
 */

import { z } from "zod";

export const FeedbackItemSchema = z
  .object({
    /** `bug` blocks this release; `change-request` is deferred to the next cycle. */
    type: z.enum(["bug", "change-request"]),
    description: z.string().min(1),
    /** Where it went: fixed-before-prod (bug) or a DLT/story id (change-request). */
    disposition: z.string().optional(),
  })
  .strict();

export const AcceptanceRecordSchema = z
  .object({
    schema_version: z.literal(1),
    record_id: z.string().regex(/^ACC-[0-9]{3,}$/),
    project_slug: z.string().min(1),
    /** Who signed off — a real person + role, on the record. */
    approved_by: z.string().min(1),
    /** What was accepted — the release/feature scope, in the client's terms. */
    scope: z.string().min(1),
    /** Pointer to what they reviewed: staging URL, build id, or a REL-* release ref. */
    release_ref: z.string().min(1),
    verdict: z.enum(["accepted", "accepted-with-conditions", "rejected"]),
    /** Required when verdict is accepted-with-conditions. */
    conditions: z.array(z.string()).default([]),
    /** ISO date the sign-off was given. */
    date: z.string(),
    /** UAT-window feedback, triaged bug vs change-request. */
    feedback: z.array(FeedbackItemSchema).default([]),
  })
  .strict()
  .refine((r) => r.verdict !== "accepted-with-conditions" || r.conditions.length > 0, {
    message: "verdict 'accepted-with-conditions' requires at least one condition",
    path: ["conditions"],
  })
  .refine((r) => r.verdict === "accepted" ? r.feedback.every((f) => f.type !== "bug") : true, {
    message: "a plain 'accepted' verdict cannot carry an unresolved bug — bugs block prod (use accepted-with-conditions or fix first)",
    path: ["feedback"],
  });

export type AcceptanceRecord = z.infer<typeof AcceptanceRecordSchema>;
export type FeedbackItem = z.infer<typeof FeedbackItemSchema>;
