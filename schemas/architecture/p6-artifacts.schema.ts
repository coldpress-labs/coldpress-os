/**
 * Phase 6 (Architecture) structured artifacts (action plan §5 P6, WS4-E). These
 * make the architecture keyable and its dependencies designed, not discovered:
 *
 *   - api-contract        the API/type surface, keyed to requirement ids (P7
 *                         contract stories extract from it).
 *   - data-model          entities/relations + per-entity retention/erasure
 *                         (feeds the DPDPA/GDPR acceptance criteria from P4).
 *   - analytics-plan      the events implementing the outcome contract.
 *   - integration-inventory third-party services with a mandatory failure-mode
 *                         row + infra cost estimate.
 */

import { z } from "zod";

// ── api-contract ──────────────────────────────────────────────────────────
export const ApiOperationSchema = z
  .object({
    id: z.string().min(1),
    method: z.string().optional(),
    path: z.string().optional(),
    /** Requirement ids this operation serves (keying → P7 contract stories). */
    requirement_ids: z.array(z.string()).optional(),
  })
  .strict();

export const ApiContractSchema = z
  .object({
    format: z.enum(["openapi", "typed-routes"]).optional(),
    operations: z.array(ApiOperationSchema),
  })
  .strict();
export type ApiContract = z.infer<typeof ApiContractSchema>;

// ── data-model ────────────────────────────────────────────────────────────
export const EntitySchema = z
  .object({
    name: z.string().min(1),
    fields: z.array(z.string()).optional(),
    /** Retention window (DPDPA/GDPR). */
    retention: z.string().optional(),
    /** How this entity's data is erased on request. */
    erasure: z.string().optional(),
  })
  .strict();

export const DataModelSchema = z
  .object({
    entities: z.array(EntitySchema),
    migrations: z.object({ zero: z.string().optional(), seed_strategy: z.string().optional() }).partial().optional(),
  })
  .strict();
export type DataModel = z.infer<typeof DataModelSchema>;

// ── analytics-plan ────────────────────────────────────────────────────────
export const AnalyticsEventSchema = z
  .object({
    name: z.string().min(1),
    properties: z.array(z.string()).optional(),
    trigger: z.string().optional(),
    destination: z.string().optional(),
    /** The outcome (outcomes.yaml requirement_id / metric) this event measures. */
    outcome_ref: z.string().optional(),
  })
  .strict();

export const AnalyticsPlanSchema = z.object({ events: z.array(AnalyticsEventSchema) }).strict();
export type AnalyticsPlan = z.infer<typeof AnalyticsPlanSchema>;

// ── integration-inventory ─────────────────────────────────────────────────
export const IntegrationSchema = z
  .object({
    name: z.string().min(1),
    kind: z.string().optional(),
    sandbox_strategy: z.string().optional(),
    webhook_signature: z.boolean().optional(),
    rate_limits: z.string().optional(),
    cost_model: z.string().optional(),
    /** REQUIRED — what the product does when this dependency is down (resilience by design). */
    failure_mode: z.string().min(1),
  })
  .strict();

export const IntegrationInventorySchema = z
  .object({
    integrations: z.array(IntegrationSchema),
    infra_cost_estimate: z.string().optional(),
  })
  .strict();
export type IntegrationInventory = z.infer<typeof IntegrationInventorySchema>;
