/**
 * PRD → architecture handoff schema (high-stakes, registry entry #4).
 *
 * Emitted by `create-prd` (Phase 4). Consumed by `create-architecture`
 * (Phase 4). The sidecar `prd.meta.json` carries the machine-checkable
 * shape of what the architect needs as input; validation failure is a
 * gate failure per docs/handoff-registry.md.
 *
 * Per plan §3.8: schema covers "architectural drivers, NFRs, constraints,
 * out-of-scope."
 */

import { z } from "zod";

export const ArchitecturalDriver = z.object({
  /** Short label used as reference anchor in the architecture doc. */
  id: z.string().min(1),
  /** One-line driver summary. */
  statement: z.string().min(10),
  /** Why this driver matters — links to PRD section. */
  rationale: z.string().min(10),
  /** Relative priority ordering for the architect. */
  priority: z.enum(["critical", "high", "medium", "low"]),
});

export const NonFunctionalRequirement = z.object({
  /** Category of NFR (performance / security / compliance / etc). */
  category: z.enum([
    "performance",
    "security",
    "compliance",
    "privacy",
    "availability",
    "reliability", // ISO 25010 — was missing (VP2 O32: surfaced when prd.meta.json got wired to routing)
    "compatibility", // ISO 25010 — was missing (VP2 O32)
    "observability",
    "maintainability",
    "accessibility",
    "scalability",
    "cost",
  ]),
  /** Short label. */
  id: z.string().min(1),
  /** Concrete, measurable statement. */
  requirement: z.string().min(10),
  /** How the architect proves it's met (test, SLO, audit, etc). */
  verifiability: z.string().min(5),
});

export const Constraint = z.object({
  /** What is constrained (budget / team / timeline / stack / etc). */
  type: z.string().min(1),
  /** Concrete constraint statement. */
  statement: z.string().min(10),
  /** Source of the constraint — stakeholder, policy, or prior decision. */
  source: z.string().min(3),
});

export const OutOfScope = z.object({
  /** What is explicitly NOT included in this product. */
  item: z.string().min(5),
  /** Why it's out-of-scope — drives the architect's "don't build" list. */
  reason: z.string().min(5),
});

/**
 * Full `prd.meta.json` shape. Consumer (create-architecture, Phase 6) reads
 * this cold to build the architecture with deterministic inputs.
 *
 * Phase II Part 4 Wave 4: added prd_version, feature_count, nfr_axes,
 * adr_references, baselines_active, brownfield_modules_count per deep-dive §4
 * handoff contract spec.
 */
export const PrdToArchitectureSchema = z.object({
  schema_version: z.literal(1),
  produced_by: z.literal("create-prd"),
  produced_at: z.string().datetime(),
  /** Project slug — sanity check against coldpress.yaml. */
  project_slug: z.string().min(1),
  /** Semver string from PRD frontmatter. */
  prd_version: z.string().min(1),
  /** Count of P0 + P1 features in the PRD. */
  feature_count: z.number().int().min(0),
  /** NFR category axes present in the PRD (e.g. performance, accessibility). */
  nfr_axes: z.array(z.string()),
  /** ADR IDs referenced in the PRD frontmatter (format: ADR-NNNN). */
  adr_references: z.array(z.string().regex(/^ADR-\d{4}$/)),
  /** Active baselines confirmed in Phase 3 stack-locking. */
  baselines_active: z.array(z.enum(["seo_aeo_llm", "accessibility", "security", "future_proof"])),
  /** Count of legacy modules in scope (0 for greenfield). */
  brownfield_modules_count: z.number().int().min(0),
  /** 1-3 sentence product summary, independent of prose PRD. */
  product_summary: z.string().min(20),
  architectural_drivers: z.array(ArchitecturalDriver).min(1),
  nfrs: z.array(NonFunctionalRequirement),
  constraints: z.array(Constraint),
  out_of_scope: z.array(OutOfScope),
});

export type PrdToArchitecture = z.infer<typeof PrdToArchitectureSchema>;
