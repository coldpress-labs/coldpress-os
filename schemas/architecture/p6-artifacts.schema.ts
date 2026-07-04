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

// ─── Security registry (P6, WS10-A3) ───────────────────────────────
// _context/architecture/security-registry.yaml. Enumerates the security-
// sensitive code paths so P7 story-slice can FORCE risk:high on any story
// whose owns/produces globs intersect one (→ P8 solo dispatch + opus verify),
// and `waves` can exclude them from team-mode parallelism. A missing registry
// means "no security-sensitive paths declared" — which the P6 gate should make
// a deliberate statement, not a silent default (see the security thread).

export const SecurityCategoryEnum = z.enum([
  "authn",
  "authz",
  "secrets",
  "pii",
  "payment",
  "crypto",
  "input-validation",
  "session",
  "access-control",
  "other",
]);
export type SecurityCategory = z.infer<typeof SecurityCategoryEnum>;

export const SecurityRegistryEntrySchema = z
  .object({
    /** Glob for the security-sensitive path(s). Story owns/produces globs are intersected against these. */
    path: z.string().min(1),
    category: SecurityCategoryEnum,
    /** Why this path is security-sensitive (audit trail). */
    reason: z.string().min(1),
    /** Architecture component id this path belongs to (keys to architecture.md). */
    component: z.string().optional(),
  })
  .strict();
export type SecurityRegistryEntry = z.infer<typeof SecurityRegistryEntrySchema>;

export const SecurityRegistrySchema = z
  .object({
    entries: z.array(SecurityRegistryEntrySchema),
  })
  .strict();
export type SecurityRegistry = z.infer<typeof SecurityRegistrySchema>;

// ─── Threat model (P6, WS10-A3) ────────────────────────────────────
// _context/architecture/threat-model.yaml. STRIDE-per-component threats +
// mitigations. Each threat keys to an architecture component and (ideally) to
// a security-registry path that carries its mitigation.

export const StrideCategoryEnum = z.enum([
  "spoofing",
  "tampering",
  "repudiation",
  "information-disclosure",
  "denial-of-service",
  "elevation-of-privilege",
]);
export type StrideCategory = z.infer<typeof StrideCategoryEnum>;

export const ThreatSchema = z
  .object({
    id: z.string().regex(/^T-\d+$/),
    /** Architecture component the threat targets. */
    component: z.string().min(1),
    category: StrideCategoryEnum,
    description: z.string().min(1),
    mitigation: z.string().min(1),
    /** Residual risk after the mitigation. */
    residual_risk: z.enum(["low", "medium", "high"]).default("low"),
    /** The security-registry path(s) where the mitigation lives (optional cross-ref). */
    security_registry_paths: z.array(z.string()).optional(),
  })
  .strict();
export type Threat = z.infer<typeof ThreatSchema>;

export const ThreatModelSchema = z
  .object({
    threats: z.array(ThreatSchema),
  })
  .strict();
export type ThreatModel = z.infer<typeof ThreatModelSchema>;
