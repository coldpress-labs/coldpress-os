/**
 * Sacred-doc change record — the contract the `sacred-guard` hook enforces
 * (action plan §4.4 / cut-list 9). A write under `_context/sacred/*` is blocked
 * unless an **approved** change record targeting that document exists.
 *
 * Records live at `_context/audit/sacred-changes/CHG-<doc>-<seq>.yaml`. They are
 * PRODUCED by the `sacred-change` skill (WS1-G, which converts the five prose
 * governance change workflows into one skill + this hook + trace blast-radius)
 * and CONSUMED (read/validated) by the sacred-guard hook.
 *
 * v0.4 scope: the hook checks `target` + `status: approved`. The blast-radius /
 * impacted-story fields (§4.4: "calls trace impact to attach blast radius and
 * flip impacted stories to re-verify") arrive with `coldpress trace` in WS2.
 */

import { z } from "zod";

/** Lifecycle of a change record. Only `approved` unblocks a sacred write. */
export const SacredChangeStatusEnum = z.enum(["proposed", "approved", "rejected", "applied"]);
export type SacredChangeStatus = z.infer<typeof SacredChangeStatusEnum>;

export const SacredChangeSchema = z
  .object({
    /** Stable id — `CHG-<doc>-<seq>` (matches the filename stem). */
    id: z.string().min(1),
    /**
     * Project-relative path of the sacred document this change authorizes,
     * e.g. `_context/sacred/prd.md`. The sacred-guard hook matches the edited
     * file against this (suffix match, tolerant of absolute vs relative).
     */
    target: z.string().min(1),
    /** Only `approved` permits the write; other states are informational. */
    status: SacredChangeStatusEnum,
    /** Why the change is being made — required (you must say why). */
    reason: z.string().min(1),
    /** Who approved it (human or role). Required once status=approved. */
    approved_by: z.string().optional(),
    /** ISO timestamp of record creation. */
    created: z.string().optional(),
    /** WS2: blast-radius story ids attached by `trace impact` on approval. */
    impacted_stories: z.array(z.string()).optional(),
  })
  .passthrough()
  .refine((v) => v.status !== "approved" || !!v.approved_by, {
    message: "status=approved requires approved_by",
  });

export type SacredChange = z.infer<typeof SacredChangeSchema>;
