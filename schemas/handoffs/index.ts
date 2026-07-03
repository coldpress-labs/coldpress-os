/**
 * Aggregated exports for the high-stakes handoff schemas.
 *
 * Consumers (skills, the `coldpress validate-handoff` CLI command) import
 * from this barrel to avoid pinning to specific file paths.
 */

export * from "./prd-to-architecture.schema.js";
export * from "./stories-to-implementation.schema.js";

import { PrdToArchitectureSchema } from "./prd-to-architecture.schema.js";
import { StoriesToImplementationSchema } from "./stories-to-implementation.schema.js";

/**
 * Registry of all high-stakes handoff schemas, keyed by a stable id.
 * Matches the registry entries in `docs/handoff-registry.md`.
 *
 * The PERT bridge (architecture-to-pert / pert-to-stories) was removed with the
 * PERT-chain excision (§8 item 10) — architecture → stories is now direct via
 * `story-slice`; the wave plan is computed by `coldpress waves` over the story graph.
 */
export const HANDOFF_SCHEMAS = {
  "prd-to-architecture": PrdToArchitectureSchema,
  "stories-to-implementation": StoriesToImplementationSchema,
} as const;

export type HandoffId = keyof typeof HANDOFF_SCHEMAS;
