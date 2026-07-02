/**
 * Handoff packet schema (action plan §4.2 / operating model §II.2). ONE schema
 * for every inter-agent boundary — replaces the Pattern-7 transition records,
 * the `phase-N-to-M-*.md` handoff logs, and the 4 orphaned JSON handoff schemas.
 *
 * Instances: `_context/handoffs/HND-<from>-<to>-<seq>.yaml`. Butler writes them;
 * a PostToolUse hook validates each against this schema; the `boundary-guard`
 * PreToolUse hook (WS2) reads the active packet's `forbidden`/ownership globs to
 * block out-of-scope writes. Scoped context + enforceable boundaries + auditable
 * orchestration from one mechanism.
 */

import { z } from "zod";

/** `sections: all` or a list of section refs (never whole docs by default). */
export const SectionsSchema = z.union([z.literal("all"), z.array(z.string().min(1)).min(1)]);

/** One scoped input — a doc plus the sections the recipient may read. */
export const HandoffInputSchema = z.object({
  doc: z.string().min(1),
  sections: SectionsSchema,
});
export type HandoffInput = z.infer<typeof HandoffInputSchema>;

export const HandoffFromSchema = z.object({
  phase: z.union([z.number().int().min(1).max(11), z.string()]),
  agent: z.string().min(1),
});

export const HandoffToSchema = z.object({
  agent: z.string().min(1),
  /** Dispatch mode (e.g. standard | quick | full) — agent-specific. */
  mode: z.string().optional(),
  /** Per-invocation model override, carried in the packet (§4.5), not the agent file. */
  model: z.string().optional(),
});

export const HandoffPacketSchema = z
  .object({
    /** `HND-<from>-<to>-<seq>` — matches the filename stem. */
    id: z.string().min(1),
    from: HandoffFromSchema,
    to: HandoffToSchema,
    /** One-line statement of what the recipient must accomplish. */
    objective: z.string().min(1),
    /** Scoped reads — sections, not whole docs. */
    inputs: z.array(HandoffInputSchema).min(1),
    /** Pointer to the executable acceptance (e.g. a stubs file). */
    acceptance: z.string().min(1),
    /** Hard constraints on the work (deps, file scope, …). */
    constraints: z.array(z.string()).default([]),
    /**
     * Globs the recipient must NOT write. Read by the boundary-guard hook.
     * Always include `_context/sacred/*` unless the packet is a sacred-change.
     */
    forbidden: z.array(z.string()).default([]),
    /** What the recipient returns (diff summary + gate results + delta records). */
    return_contract: z.string().min(1),
  })
  .strict();

export type HandoffPacket = z.infer<typeof HandoffPacketSchema>;

export function parseHandoffPacket(input: unknown): HandoffPacket {
  return HandoffPacketSchema.parse(input);
}
