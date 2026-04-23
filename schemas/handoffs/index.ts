/**
 * Aggregated exports for the high-stakes handoff schemas.
 *
 * Consumers (skills, the `coldpress validate-handoff` CLI command) import
 * from this barrel to avoid pinning to specific file paths.
 */

export * from "./prd-to-architecture.schema.js";
export * from "./architecture-to-pert.schema.js";
export * from "./pert-to-stories.schema.js";
export * from "./stories-to-implementation.schema.js";

import { ArchitectureToPertSchema } from "./architecture-to-pert.schema.js";
import { PertToStoriesSchema } from "./pert-to-stories.schema.js";
import { PrdToArchitectureSchema } from "./prd-to-architecture.schema.js";
import { StoriesToImplementationSchema } from "./stories-to-implementation.schema.js";

/**
 * Registry of all high-stakes handoff schemas, keyed by a stable id.
 * Matches the registry entries in `docs/handoff-registry.md`.
 */
export const HANDOFF_SCHEMAS = {
  "prd-to-architecture": PrdToArchitectureSchema,
  "architecture-to-pert": ArchitectureToPertSchema,
  "pert-to-stories": PertToStoriesSchema,
  "stories-to-implementation": StoriesToImplementationSchema,
} as const;

export type HandoffId = keyof typeof HANDOFF_SCHEMAS;
