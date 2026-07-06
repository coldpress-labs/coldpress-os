/**
 * `boundary-guard` — PreToolUse(Edit|Write) hook (action plan §4.4 / §4.2).
 *
 * Enforces the active handoff packet's boundary: a write matching the packet's
 * `forbidden` globs is BLOCKED. This makes scoped delegation real — a subagent
 * dispatched with a packet cannot wander outside its lane (e.g. edit
 * `_context/sacred/*` or `src/lib/payments/*` when the packet forbids them).
 *
 * "Active packet": the `_context/handoffs/HND-*.yaml` whose `to.agent` matches
 * the dispatching subagent (`agent_type`), else the most recently modified
 * packet. No packet → no opinion (Butler working directly, no delegation
 * boundary). Overridable via COLDPRESS_OVERRIDE="boundary-guard:<reason>".
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { HandoffPacketSchema, type HandoffPacket } from "../../schemas/handoff.schema.js";
import { pathMatchesAny } from "../utils/glob-match.js";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

const HANDOFF_DIR = "_context/handoffs";

const EXPLAIN = `boundary-guard (PreToolUse: Edit|Write)
Blocks a write that matches the active handoff packet's \`forbidden\` globs, so a
subagent dispatched with a packet cannot write outside its lane. The active packet
is the _context/handoffs/HND-*.yaml targeting the current agent (or the most
recent one). No active packet → no boundary. Override (logged):
COLDPRESS_OVERRIDE="boundary-guard:<reason>".`;

/** List the `HND-*.yaml` files under cwd's handoff dir (empty if none/unreadable). */
function handoffFiles(cwd: string): string[] {
  const dir = join(cwd, HANDOFF_DIR);
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir).filter((f) => /^HND-.*\.ya?ml$/.test(f));
  } catch {
    return [];
  }
}

/**
 * DV2: HND packet files exist on disk but NONE parses (`HandoffPacketSchema`).
 * `activePacket` returns undefined in this case exactly as it does when there are
 * no packets at all — so without this signal the boundary silently vanishes. The
 * handler turns a true here into a warning (never let enforcement disappear quietly).
 */
export function unparseablePacketsPresent(cwd: string): boolean {
  const files = handoffFiles(cwd);
  if (files.length === 0) return false;
  const dir = join(cwd, HANDOFF_DIR);
  return !files.some((f) => {
    try {
      return HandoffPacketSchema.safeParse(parseYaml(readFileSync(join(dir, f), "utf8"))).success;
    } catch {
      return false;
    }
  });
}

/** Find the active handoff packet under cwd for the given agent. */
export function activePacket(cwd: string, agentType: string | undefined): HandoffPacket | undefined {
  const dir = join(cwd, HANDOFF_DIR);
  const files = handoffFiles(cwd);
  if (files.length === 0) return undefined;
  const packets: { packet: HandoffPacket; mtime: number }[] = [];
  for (const f of files) {
    const full = join(dir, f);
    try {
      const parsed = HandoffPacketSchema.safeParse(parseYaml(readFileSync(full, "utf8")));
      if (parsed.success) packets.push({ packet: parsed.data, mtime: statSync(full).mtimeMs });
    } catch {
      /* skip malformed */
    }
  }
  if (packets.length === 0) return undefined;
  if (agentType) {
    const match = packets
      .filter((p) => p.packet.to.agent === agentType)
      .sort((a, b) => b.mtime - a.mtime)[0];
    if (match) return match.packet;
  }
  return packets.sort((a, b) => b.mtime - a.mtime)[0]!.packet;
}

export const boundaryGuardHandler: HookHandler = {
  name: "boundary-guard",
  event: "PreToolUse",
  overrideGate: "boundary-guard",
  explain: EXPLAIN,
  run(input: HookInput): HookDecision {
    const filePath = typeof input.tool_input?.file_path === "string" ? input.tool_input.file_path : "";
    if (!filePath) return { kind: "none" };
    const cwd = input.cwd ?? process.cwd();
    const agentType = typeof input.agent_type === "string" ? input.agent_type : undefined;
    const packet = activePacket(cwd, agentType);
    if (!packet) {
      // DV2: distinguish "no delegation" (legit — no opinion) from "packets
      // exist but none parses" (the boundary silently vanished — warn loudly).
      if (unparseablePacketsPresent(cwd)) {
        return {
          kind: "context",
          text:
            `⚠ boundary-guard: handoff packet(s) present under ${HANDOFF_DIR}/ but none parses against ` +
            `HandoffPacketSchema — the write-scope boundary is NOT being enforced. Fix the packet (or ` +
            `remove it) so delegated writes are scope-checked again.`,
        };
      }
      return { kind: "none" };
    }
    const owns = packet.owns ?? [];
    // No boundary declared at all → no opinion.
    if (packet.forbidden.length === 0 && owns.length === 0) return { kind: "none" };

    // Denylist: a forbidden write is always blocked.
    if (pathMatchesAny(filePath, packet.forbidden)) {
      return {
        kind: "deny",
        reason:
          `Blocked by handoff packet ${packet.id}: ${filePath} is outside this task's scope ` +
          `(matches a forbidden path). This delegation may write only within its lane. ` +
          `If the scope is genuinely wrong, record a delta or re-issue the packet — ` +
          `override once (logged): COLDPRESS_OVERRIDE="boundary-guard:<reason>".`,
      };
    }

    // Allowlist (WS10-B4): when the packet declares `owns`, a write must land
    // inside `owns` ∪ `produces` — the story-as-contract write-scope. This makes
    // dev-story's "edits stay inside the packet's owns globs" a real guarantee.
    if (owns.length > 0) {
      const writeScope = [...owns, ...(packet.produces ?? [])];
      if (!pathMatchesAny(filePath, writeScope)) {
        return {
          kind: "deny",
          reason:
            `Blocked by handoff packet ${packet.id}: ${filePath} is outside this task's ownership scope ` +
            `(not within owns/produces: ${writeScope.join(", ")}). A story writes only what it owns — ` +
            `an out-of-scope need is a delta (DLT record), not a stray edit. ` +
            `Override once (logged): COLDPRESS_OVERRIDE="boundary-guard:<reason>".`,
        };
      }
    }
    return { kind: "none" };
  },
};
