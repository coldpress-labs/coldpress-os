/**
 * Verify-pack contract (v0.4 WS9, §7.6/§7.19). A verify pack declares what a
 * project's VERIFICATION consists of — the gates the verifier runs. `web` is the
 * default (Playwright + tokens + axe + Lighthouse); `llm-app` wires the existing
 * `src/llm-gates/` normalizers + the deployment LLM skills (product-eval gates)
 * — already-implemented code the v1.0 plan had left unplaced; `research-spike`
 * has no code gates (findings-memo exit).
 *
 * Selected via a profile's `defaults.verify_pack` / coldpress.yaml `verify_pack`.
 * Instance: `data/verify-packs/<name>.yaml`.
 */

import { z } from "zod";
import { VerifyPackEnum } from "./profile.schema.js";

/** One verification gate the pack runs. */
export const VerifyGateSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    /** The skill/command that runs it. */
    skill_ref: z.string().min(1),
    severity: z.enum(["block", "warn"]),
    /** Test-architecture layer (G2), where applicable. */
    layer: z.string().optional(),
    note: z.string().optional(),
  })
  .strict();

export const VerifyPackSchema = z
  .object({
    schema_version: z.literal(1),
    name: VerifyPackEnum,
    description: z.string().min(1),
    gates: z.array(VerifyGateSchema).min(1),
    /**
     * `src/llm-gates/` normalizers this pack uses (llm-app / voice-agent) —
     * DeepEval / Promptfoo / Giskard → the shared ScanResult shape.
     */
    normalizers: z.array(z.enum(["deepeval", "promptfoo", "giskard"])).default([]),
  })
  .strict()
  .refine((p) => (p.name === "llm-app" || p.name === "voice-agent" ? p.normalizers.length > 0 : true), {
    message: "llm-app / voice-agent verify packs must declare at least one llm-gate normalizer",
    path: ["normalizers"],
  });

export type VerifyPack = z.infer<typeof VerifyPackSchema>;
