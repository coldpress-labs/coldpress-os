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

/** Find the active handoff packet under cwd for the given agent. */
export function activePacket(cwd: string, agentType: string | undefined): HandoffPacket | undefined {
  const dir = join(cwd, HANDOFF_DIR);
  if (!existsSync(dir)) return undefined;
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => /^HND-.*\.ya?ml$/.test(f));
  } catch {
    return undefined;
  }
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
    if (!packet || packet.forbidden.length === 0) return { kind: "none" };
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
    return { kind: "none" };
  },
};
