/**
 * Project-profile schema (v0.4 WS9, §4.9). A profile is the top-level preset
 * chosen at intake — ONE answer that pre-fills every axis (stack/deploy/verify
 * packs, lane, tier, MCP set, eval subset), all individually overridable
 * afterward (a profile is defaults, not a cage).
 *
 * Profiles are HARVESTED, never speculated: one ships only after a real project
 * of that shape has been delivered (`pack-harvest`, §5 P11). This schema folds in
 * the old `install/archetypes/` override mechanics (subagent/skill overrides);
 * the four speculative archetype YAMLs are superseded by the harvested roster.
 *
 * Instance: `data/profiles/<id>.yaml`. Selected via `profile:` in coldpress.yaml.
 */

import { z } from "zod";

/** Verification pack (§7.6). `web` is the default; `llm-app`/`voice-agent` for LLM products. */
export const VerifyPackEnum = z.enum(["web", "llm-app", "voice-agent", "content-pipeline", "research-spike"]);
export type VerifyPack = z.infer<typeof VerifyPackEnum>;

/** The axes a profile pre-fills. Everything here is a DEFAULT — overridable. */
export const ProfileDefaultsSchema = z
  .object({
    /** Stack pack (skills/stack-packs/<id>). Omitted for non-code profiles (research-spike). */
    stack_pack: z.string().optional(),
    /** Deploy pack (data/deploy-packs/<id>). Omitted where there's nothing to deploy. */
    deploy_pack: z.string().optional(),
    verify_pack: VerifyPackEnum,
    lane: z.enum(["lite", "full"]),
    security_tier: z.enum(["T0", "T1", "T2"]),
  })
  .strict();

/** Archetype override mechanics, folded in from install/archetypes/. */
export const ProfileOverridesSchema = z
  .object({
    subagent_overrides: z.array(z.string()).default([]),
    skill_overrides: z.object({ disable: z.array(z.string()).default([]), enable: z.array(z.string()).default([]) }).default({ disable: [], enable: [] }),
  })
  .strict();

export const ProfileSchema = z
  .object({
    schema_version: z.literal(1),
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    name: z.string().min(1),
    description: z.string().min(1),
    /** `harvested` = a real project of this shape shipped; `seed` = baseline (app-build). */
    status: z.enum(["harvested", "seed"]),
    defaults: ProfileDefaultsSchema,
    overrides: ProfileOverridesSchema.default({ subagent_overrides: [], skill_overrides: { disable: [], enable: [] } }),
    /** Feature flags a shape turns on (e.g. content_workstream for content-led sites). */
    flags: z.record(z.string(), z.boolean()).default({}),
    /** MCP servers this shape typically enables. */
    mcp_set: z.array(z.string()).default([]),
    /** Golden-task id substrings this profile's eval subset runs (feeds `coldpress evals --filter`). */
    eval_subset: z.array(z.string()).default([]),
  })
  .strict()
  .refine((p) => p.defaults.verify_pack === "research-spike" || p.defaults.stack_pack !== undefined, {
    message: "a code profile must declare a stack_pack (only research-spike may omit it)",
    path: ["defaults", "stack_pack"],
  });

export type Profile = z.infer<typeof ProfileSchema>;
