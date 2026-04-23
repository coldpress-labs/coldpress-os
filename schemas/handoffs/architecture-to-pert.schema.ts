/**
 * architecture → PERT handoff schema (high-stakes, registry entry #5).
 *
 * Emitted by `create-architecture` (Phase 4). Consumed by
 * `parallelization-strategy` (Phase 5). The sidecar
 * `architecture.meta.json` carries the component graph + risk ratings
 * that the PERT generator needs to produce a useful wave plan.
 *
 * Per plan §3.8: schema covers "components, dependencies, risk ratings."
 */

import { z } from "zod";

export const Component = z.object({
  /** Stable identifier used across the architecture + PERT + stories. */
  id: z.string().min(1),
  /** Human label (e.g., "Auth Service", "UI Shell"). */
  name: z.string().min(1),
  /** What this component owns. */
  responsibility: z.string().min(10),
  /** Technology / layer this component lives in. */
  layer: z.enum([
    "ui",
    "api",
    "service",
    "data",
    "infrastructure",
    "ops",
    "shared",
  ]),
  /** Risk-based estimate of implementation difficulty — drives wave placement. */
  risk: z.enum(["low", "medium", "high", "critical"]),
  /** Brief rationale for the risk rating (what's novel / what's fragile). */
  risk_rationale: z.string().min(5),
  /** Rough effort estimate — consumed by PERT for wave sizing. */
  effort_size: z.enum(["xs", "s", "m", "l", "xl"]),
});

export const Dependency = z.object({
  /** Component that needs the other component. */
  from: z.string().min(1),
  /** Component being depended on. */
  to: z.string().min(1),
  /** Nature of dependency — affects parallelizability. */
  kind: z.enum([
    "runtime", // needs the other running to function
    "api", // contract-only, either can build in parallel given an agreed interface
    "data", // needs the other's data model
    "build", // build-time only (compile-time dep, shared type, codegen)
    "deploy", // deploy-ordering constraint
  ]),
  /** If kind=api, can the interface be stubbed? (Determines wave independence.) */
  stubable: z.boolean().optional(),
});

/**
 * Full `architecture.meta.json` shape. Consumer (parallelization-strategy)
 * reads this + the prose architecture.md to generate the PERT chart.
 */
export const ArchitectureToPertSchema = z.object({
  schema_version: z.literal(1),
  produced_by: z.literal("create-architecture"),
  produced_at: z.string().datetime(),
  project_slug: z.string().min(1),
  /** Pointer back to the PRD sidecar that drove this architecture. */
  upstream_prd_path: z.string().min(1),
  /** High-level architectural style — influences PERT granularity. */
  style: z.enum([
    "monolith",
    "modular-monolith",
    "microservices",
    "serverless",
    "client-only",
    "hybrid",
    "other",
  ]),
  components: z.array(Component).min(1),
  dependencies: z.array(Dependency),
  /** Cross-component NFRs inherited from the PRD (for PERT to annotate on stories). */
  cross_cutting_concerns: z.array(
    z.object({
      nfr_id: z.string().min(1),
      impacted_components: z.array(z.string().min(1)).min(1),
    }),
  ),
});

export type ArchitectureToPert = z.infer<typeof ArchitectureToPertSchema>;
