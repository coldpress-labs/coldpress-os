/**
 * Wiring manifest schema (WS10-G) — the machine-readable registry of every
 * cross-phase artifact and who produces + consumes it.
 *
 * Instance: `data/wiring.yaml`. `coldpress doctor --wiring` (and a CI job) walk
 * it and assert the invariant that survived three review passes + 1000 green
 * tests: **every consumed artifact has a producer, every producer/consumer path
 * resolves, and every referenced schema exists.** This converts the entire
 * "consumer built + unit-tested against fixtures, producer missing" audit class
 * (system-integration audit Classes A/B) into a permanent, cheap CI check.
 */

import { z } from "zod";

export const WiringArtefactSchema = z
  .object({
    /** The artifact's canonical instance path under a project (`_context/...`). */
    path: z.string().min(1),
    /** Optional one-line note on what the artifact is. */
    note: z.string().optional(),
    /** The schema that validates it (repo-relative), if any. Checked to exist. */
    schema: z.string().optional(),
    /**
     * The producer — a lifecycle/skills dir or a `src/…`/CLI path that WRITES it.
     * Repo-relative. Checked to exist. `null` is an EXPLICIT "no producer yet"
     * marker (a known gap) so the check can distinguish a gap from an omission.
     */
    producer: z.string().nullable(),
    /** The consumers — repo-relative dirs/files that READ it. Each checked to exist. */
    consumers: z.array(z.string()).min(1),
  })
  .strict();
export type WiringArtefact = z.infer<typeof WiringArtefactSchema>;

export const WiringManifestSchema = z
  .object({
    artifacts: z.array(WiringArtefactSchema),
  })
  .strict();
export type WiringManifest = z.infer<typeof WiringManifestSchema>;

export function parseWiring(input: unknown): WiringManifest {
  return WiringManifestSchema.parse(input);
}
