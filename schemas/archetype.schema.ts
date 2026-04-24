/**
 * Project archetype manifest schema (§6.3).
 *
 * Archetypes specialise the framework WITHIN the 9-phase spine — they
 * never fork it. A manifest declares three classes of override applied
 * at `coldpress init --archetype <name>` time:
 *
 *   1. Subagent overrides per phase (e.g. swap @developer for a
 *      data-interpreter variant during Phase 6 Implementation)
 *   2. Skill palette overrides (activate / deactivate specific skills
 *      from the global registry)
 *   3. Template preset overrides (different PRD sections for research
 *      vs. app-build, etc.)
 *
 * Hard rules:
 *   - `phase` always refers to a phase in the canonical 1..9 lifecycle.
 *     Archetypes never introduce new phases.
 *   - Subagent override `replace_with` MUST reference a known subagent
 *     slug (the loader doesn't validate this — that's the consumer's
 *     job at apply time, since the slug set depends on shipped agents
 *     plus archetype-introduced variants).
 *   - Skill `disable[]` and `enable[]` are mutually exclusive at the
 *     global level (a manifest doesn't disable AND enable the same
 *     skill); the schema enforces.
 */

import { z } from "zod";

const SLUG = z.string().regex(
  /^[a-z][a-z0-9-]*$/,
  "must be a kebab-case slug starting with a letter",
);
const PHASE = z.number().int().min(1).max(9);

export const ArchetypeSubagentOverrideSchema = z.object({
  /** Phase the override applies to. Must be 1..9. */
  phase: PHASE,
  /** Subagent slug being replaced (e.g. `developer`). */
  replace: SLUG,
  /** Slug of the variant subagent that takes over. */
  replace_with: SLUG,
  /** One-line rationale shown to the user at scaffold time. */
  reason: z.string().min(1),
});

export type ArchetypeSubagentOverride = z.infer<
  typeof ArchetypeSubagentOverrideSchema
>;

export const ArchetypeSkillOverridesSchema = z
  .object({
    /** Skills that should NOT scaffold .claude/skills/ wrappers for this archetype. */
    disable: z.array(SLUG).default([]),
    /**
     * Skills that ARE scaffolded for this archetype but would not be by
     * default (rarely needed — most skills are universal). Used when an
     * archetype introduces opt-in skills the global registry would not
     * dispatch automatically.
     */
    enable: z.array(SLUG).default([]),
  })
  .superRefine((v, ctx) => {
    const overlap = v.disable.filter((s) => v.enable.includes(s));
    if (overlap.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["disable"],
        message:
          `archetype manifest both disables and enables: ${overlap.join(", ")}. ` +
          `A skill should appear in only one list.`,
      });
    }
  });

export type ArchetypeSkillOverrides = z.infer<typeof ArchetypeSkillOverridesSchema>;

export const ArchetypeTemplateOverrideSchema = z.object({
  /**
   * Canonical template id from `templates/documents/` (e.g. "prd",
   * "context", "architecture"). Loader does NOT verify the template
   * exists — that's an apply-time concern.
   */
  template: SLUG,
  /**
   * Path to the override file SHIPPED WITH THE ARCHETYPE under
   * `install/archetypes/<archetype-slug>/<template>.md`. Resolved
   * relative to the archetype manifest's directory at apply time.
   */
  source: z.string().min(1),
  /** One-line rationale. */
  reason: z.string().min(1),
});

export type ArchetypeTemplateOverride = z.infer<
  typeof ArchetypeTemplateOverrideSchema
>;

export const ArchetypeManifestSchema = z.object({
  schema_version: z.literal(1),
  /** Kebab-case archetype id matching the YAML filename basename. */
  id: SLUG,
  /** Short human title (≤ 80 chars). */
  name: z.string().min(1).max(80),
  /** One-paragraph what-this-archetype-is-for. */
  description: z.string().min(1),
  /**
   * Stability label. `experimental` means consumers should expect the
   * manifest shape AND override semantics to evolve. `stable` means
   * back-compat applies.
   */
  status: z.enum(["experimental", "stable"]),
  /**
   * When several archetypes are valid candidates for a project, the
   * loader picks the highest-priority one as default. Default 0; range
   * 0..100. Reserved for future smart-detection logic.
   */
  priority: z.number().int().min(0).max(100).default(0),
  /**
   * Phase-specific subagent swaps. May be empty for archetypes that
   * differ only in skill palette or templates.
   */
  subagent_overrides: z.array(ArchetypeSubagentOverrideSchema).default([]),
  /** Skill palette overrides. */
  skill_overrides: ArchetypeSkillOverridesSchema.default({
    disable: [],
    enable: [],
  }),
  /** Template preset overrides. */
  template_overrides: z.array(ArchetypeTemplateOverrideSchema).default([]),
  /**
   * Free-form notes for archetype authors and reviewers. Not consumed
   * programmatically.
   */
  notes: z.string().optional(),
});

export type ArchetypeManifest = z.infer<typeof ArchetypeManifestSchema>;

/**
 * The four canonical v1 archetypes shipped under
 * `install/archetypes/`. Used by the loader to validate that a
 * requested archetype name is known. Adding a new archetype: drop a
 * new YAML file + add the slug here + update `docs/archetypes-guide.md`.
 */
export const SHIPPED_ARCHETYPES = [
  "app-build",
  "data-heavy",
  "infrastructure",
  "research",
] as const;

export type ShippedArchetype = (typeof SHIPPED_ARCHETYPES)[number];
