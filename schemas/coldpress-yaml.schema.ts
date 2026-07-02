/**
 * `coldpress.yaml` whole-file schema (action plan §4.1 / §4.9; closes the
 * audit §2.5 gap — "No schema for coldpress.yaml as a whole").
 *
 * `coldpress.yaml` is the ONLY config file coldpress-os reads from a project.
 * It accretes across the lifecycle: `coldpress init` fills the Phase-1 core
 * (`project.*`, `user.*`), Butler fills intake fields, and each later phase
 * writes back its owning fields (stack_pack at P3, sacred_docs paths at P4,
 * etc. — see docs/coldpress-yaml-schema.md for per-field phase ownership).
 *
 * Because the file legitimately carries arbitrary **stack-pack-specific
 * blocks** (e.g. a top-level `convex:` block, docs §"Phase 3+ overrides") and
 * accretes fields over phases, this schema is **`.passthrough()`, not
 * `.strict()`**: it types the known fields and requires the Phase-1 core, but
 * tolerates pack blocks and forward-compatible keys rather than rejecting them.
 *
 * Used by:
 *   - The P1 `schema-validate` PostToolUse hook — validates coldpress.yaml on
 *     write (the missing validator this schema provides).
 *   - `coldpress doctor` — config coherence.
 *
 * The v0.4 fields (`profile`, `lane`, `security_tier`, `interop`, `deploy_pack`,
 * `verify_pack`) are optional here; they are populated by the profile answer at
 * intake (§4.9) and their owning phases. `lane`/`security_tier` reuse the enums
 * from `state.schema.ts` so config and orchestration state cannot diverge.
 */

import { z } from "zod";
import { LaneEnum, SecurityTierEnum } from "./state.schema.js";

/** Interop emission targets (§8 item 14). Default emission is `agents-md` only. */
export const InteropTargetEnum = z.enum([
  "agents-md",
  "cursor",
  "roo",
  "openhands",
  "cline",
]);
export type InteropTarget = z.infer<typeof InteropTargetEnum>;

/** Butler turn-by-turn verbosity (docs §Phase-1 intake fields). */
export const CadenceEnum = z.enum(["silent", "summary", "verbose"]);
/** Stakeholder shape seed (docs §Phase-1 intake fields). */
export const TeamShapeEnum = z.enum(["solo", "team", "client-project"]);

const ProjectSchema = z
  .object({
    /** Human-readable project name — required at every phase boundary (docs §Validation). */
    name: z.string().min(1),
    /** kebab-case identifier — required at every phase boundary. */
    slug: z.string().min(1),
    /** Written by P3 stack-evaluation from data/classification/project-types.csv. */
    type: z.string().optional(),
    /** Written by P3 stack-evaluation from data/classification/domain-complexity.csv. */
    domain: z.string().optional(),
    /** Project pattern: a (three-tier) | b (single-repo) | c (framework) | d (non-code). */
    pattern: z.string().optional(),
  })
  .passthrough();

const UserSchema = z
  .object({
    /** For personalisation in prose. Required at prose-producing phases; may be "" at init. */
    name: z.string().optional(),
    communication_language: z.string().optional(),
    document_output_language: z.string().optional(),
    /** IDE preferences; prunes interop emission (legacy field — see `interop` for v0.4). */
    preferred_ides: z.array(z.string()).optional(),
    cadence: CadenceEnum.optional(),
    team_shape: TeamShapeEnum.optional(),
  })
  .passthrough();

const ButlerSchema = z
  .object({
    /** User-facing label for the orchestrator; framework-internal role stays "Butler". */
    display_name: z.string().optional(),
  })
  .passthrough();

/** One baseline category (P3 stack-locking; validated in detail by baselines.schema.json). */
const BaselineCategorySchema = z
  .object({
    status: z.string().optional(),
    covered_by_pack: z.union([z.string(), z.boolean()]).optional(),
    rationale: z.string().optional(),
    overrides: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const BaselinesSchema = z
  .object({
    seo_aeo_llm: BaselineCategorySchema.optional(),
    accessibility: BaselineCategorySchema.optional(),
    security: BaselineCategorySchema.optional(),
    future_proof: BaselineCategorySchema.optional(),
  })
  .passthrough();

const SacredDocsSchema = z
  .object({
    context: z.string().optional(),
    tech_stack: z.string().optional(),
    prd: z.string().optional(),
    architecture: z.string().optional(),
    pert: z.string().optional(),
  })
  .passthrough();

/**
 * The whole `coldpress.yaml`. Passthrough top-level (pack blocks + forward
 * fields), but the known structural fields are typed and the Phase-1 core
 * (`project.name`/`slug`) is required.
 */
export const ColdpressYamlSchema = z
  .object({
    project: ProjectSchema,
    user: UserSchema.optional(),
    butler: ButlerSchema.optional(),

    // ── v0.4 fields (§4.1 / §4.9) — populated by the profile answer + owning phases ──
    /** Top-level intake preset that pre-fills every axis (§4.9). Optional pre-P1. */
    profile: z.string().optional(),
    /** Ceremony lane; mirrors state.yaml `lane`. Default lite (§6). */
    lane: LaneEnum.optional(),
    /** Security tier; mirrors state.yaml `security_tier` (§7.3). */
    security_tier: SecurityTierEnum.optional(),
    /** Opt-in interop targets beyond the AGENTS.md default (§8 item 14). */
    interop: z.array(InteropTargetEnum).optional(),
    /** Selected deploy pack, orthogonal to stack_pack (§5 P3, WS6). */
    deploy_pack: z.string().optional(),
    /** Selected verifier pack (§7.6). */
    verify_pack: z.string().optional(),

    // ── existing lifecycle fields ──
    /** Activates skills/stack-packs/{pack}/ — written by P3 stack-locking. */
    stack_pack: z.string().optional(),
    baselines: BaselinesSchema.optional(),
    agents: z.record(z.string(), z.record(z.string(), z.string())).optional(),
    sacred_docs: SacredDocsSchema.optional(),
  })
  .passthrough();

export type ColdpressYaml = z.infer<typeof ColdpressYamlSchema>;

/**
 * Parse + validate an unknown value (parsed coldpress.yaml). Throws a ZodError
 * with field-level detail on mismatch; the `schema-validate` hook surfaces that
 * back into the loop (exit 2).
 */
export function parseColdpressYaml(input: unknown): ColdpressYaml {
  return ColdpressYamlSchema.parse(input);
}
