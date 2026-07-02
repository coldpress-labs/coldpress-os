/**
 * Deploy-pack contract (v0.4 WS6, §5 P9 / §9 WS6).
 *
 * A deploy pack makes "deploy anywhere" real: the uniform deploy skills
 * (`deploy-staging`, `deploy-prod`, `deploy-preview`, `smoke`, `rollback`) read
 * the selected pack's `pack.yaml` and dispatch the platform's CLI. The pack is
 * DATA (CLI + targets + env mapping + smoke config); the skills are uniform, so
 * the same demo ships to Vercel or Cloudflare by changing one config line
 * (`deploy_pack:` in coldpress.yaml).
 *
 * ── Coupled to the P3 tech stack (orthogonal, not independent) ──
 * The deploy pack is chosen at **Phase 3** by `deploy-select`, and it is bound to
 * the locked `stack_pack` two ways:
 *   1. SELECTION — `deploy-select` only offers packs whose `compatible_stacks`
 *      include the locked stack (the stack×deploy compatibility matrix; unsupported
 *      pairs warn). deploy_pack is orthogonal to stack_pack but constrained by it.
 *   2. BUILD CONFIG — the stack pack owns *what/how to build* (build command,
 *      output dir, node version); the deploy pack owns *where/how to ship*. A pack's
 *      `deploy_cmd` references build values (`${BUILD_DIR}`, `${BUILD_CMD}`, …) that
 *      are RESOLVED FROM the locked stack / coldpress.yaml stack-lock baselines — the
 *      pack does not define them. `stack_inputs` declares which it consumes so
 *      `deploy-select` can verify the locked stack provides them.
 *
 * Instance: `data/deploy-packs/<name>/pack.yaml`.
 */

import { z } from "zod";

/** A deploy target (staging or production) — how the pack reaches an environment. */
export const DeployTargetSchema = z
  .object({
    /** The CLI invocation that deploys to this environment (uses ${VARS} from env_mapping). */
    deploy_cmd: z.string().min(1),
    /** Optional URL (or pattern) the environment is reachable at, for smoke. */
    url: z.string().optional(),
    /** Human note on how the target is provisioned (branch, project, account). */
    notes: z.string().optional(),
  })
  .strict();

/** Post-deploy smoke configuration — what "is it actually up + correct" means. */
export const SmokeSchema = z
  .object({
    /** Key routes to fetch + assert HTTP 200 (or the declared status). */
    routes: z.array(z.string()).default([]),
    /** A content sentinel string that must appear on the primary route. */
    content_sentinel: z.string().optional(),
    /** Path to one Playwright happy-path spec run against the deployed URL. */
    happy_path_spec: z.string().optional(),
    /** Whether smoke asserts analytics-plan events arrive at their destination (P9). */
    asserts_analytics: z.boolean().default(false),
  })
  .strict();

export const DeployPackSchema = z
  .object({
    schema_version: z.literal(1),
    /** Pack id — matches the directory name + `deploy_pack:` in coldpress.yaml. */
    name: z.string().regex(/^[a-z][a-z0-9-]*$/),
    /** Platform label (Vercel, Cloudflare Pages, Netlify, …). */
    platform: z.string().min(1),
    /** The CLI the pack drives (prefer CLIs over MCP servers, §5 P9). */
    cli: z.string().min(1),
    /** Capabilities — the uniform skills check these before offering a verb. */
    capabilities: z
      .object({
        /** Per-story/wave preview URLs (§5 P8). Skipped on packs that lack it. */
        deploy_preview: z.boolean().default(false),
        /** Rollback-as-a-skill, rehearsed once per project on staging. */
        rollback: z.boolean().default(false),
      })
      .strict(),
    /** staging is required (walking skeleton lives here); production is required for a shippable pack. */
    targets: z
      .object({
        staging: DeployTargetSchema,
        production: DeployTargetSchema,
        /** Preview command (only when capabilities.deploy_preview). */
        preview: DeployTargetSchema.optional(),
      })
      .strict(),
    /** How `secure/manifest.yaml` keys map onto the platform's env/secret store. */
    env_mapping: z
      .object({
        /** CLI/command that pushes a secure/ key into the platform env. */
        set_cmd: z.string().min(1),
        /** Notes on scoping (per-environment, encrypted, etc.). */
        notes: z.string().optional(),
      })
      .strict(),
    smoke: SmokeSchema,
    /** Rollback invocation (required when capabilities.rollback). */
    rollback_cmd: z.string().optional(),
    /** Stack packs this deploy pack is known-compatible with (feeds the stack×deploy matrix). */
    compatible_stacks: z.array(z.string()).default([]),
    /**
     * Build values the pack's commands consume FROM the locked stack pack /
     * coldpress.yaml stack-lock baselines (not defined here). e.g. BUILD_CMD,
     * BUILD_DIR, NODE_VERSION. `deploy-select` verifies the locked stack provides
     * these before offering the pack.
     */
    stack_inputs: z.array(z.string()).default([]),
  })
  .strict()
  .refine((p) => !p.capabilities.deploy_preview || p.targets.preview !== undefined, {
    message: "capabilities.deploy_preview requires targets.preview",
    path: ["targets", "preview"],
  })
  .refine((p) => !p.capabilities.rollback || (p.rollback_cmd?.length ?? 0) > 0, {
    message: "capabilities.rollback requires rollback_cmd",
    path: ["rollback_cmd"],
  });

export type DeployPack = z.infer<typeof DeployPackSchema>;
