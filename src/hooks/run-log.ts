/**
 * `run-log` — Stop / SubagentStop hook (action plan §4.4).
 *
 * Appends a structured `session-boundary` event to the EventStream on every
 * session/subagent stop, so no run ends without its arc being capturable — the
 * intake for the WS7 evolution loop. Reuses the existing EventStream writer
 * (`src/event-stream/`); v0.4/WS1 records what the Stop hook has (boundary,
 * agent, phase/lane from state.yaml). WS7 enriches with model + token counts +
 * gate results + taxonomy tags.
 *
 * Never blocks (returns "none") and is fully fail-open — logging must never
 * wedge a session. One run per session: the run id is derived from session_id so
 * repeated stops append to the same `.coldpress/runs/<run>/events.jsonl`.
 */

import { EventStreamWriter } from "../event-stream/writer.js";
import { readState } from "./state-io.js";
import type { TokenUsage } from "../../schemas/event-stream.schema.js";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : undefined;
}

/**
 * Extract `model` + token usage from the Stop payload WHERE the runtime exposes
 * it (§4.8 "tokens where exposed"). Reads the common field shapes defensively;
 * omits what isn't present (both fields are optional on the event). Enrichment
 * plumbing — populated as/when Claude Code surfaces usage on Stop.
 */
export function extractUsage(input: HookInput): { model?: string; tokens?: TokenUsage } {
  const out: { model?: string; tokens?: TokenUsage } = {};
  if (typeof input.model === "string") out.model = input.model;
  const usage = (input.usage ?? input.tokens) as Record<string, unknown> | undefined;
  if (usage && typeof usage === "object") {
    const inTok = num(usage.input_tokens ?? usage.input);
    const outTok = num(usage.output_tokens ?? usage.output);
    const total =
      num(usage.total_tokens ?? usage.total) ??
      (inTok !== undefined || outTok !== undefined ? (inTok ?? 0) + (outTok ?? 0) : undefined);
    const tokens: TokenUsage = {};
    if (inTok !== undefined) tokens.input = inTok;
    if (outTok !== undefined) tokens.output = outTok;
    if (total !== undefined) tokens.total = total;
    if (Object.keys(tokens).length) out.tokens = tokens;
  }
  return out;
}

const EXPLAIN = `run-log (Stop / SubagentStop)
Appends a session-boundary event to .coldpress/runs/<run>/events.jsonl on every
stop, so every run's arc is captured for the evolution loop. Records the boundary
kind, agent, and phase/lane (from state.yaml). Never blocks; fully fail-open.
Not overridable (nothing to override — it only records).`;

/** Derive a valid kebab-case run id from a session id (RUN_ID regex). */
export function runIdFromSession(sessionId: string | undefined): string | undefined {
  if (!sessionId) return undefined;
  const slug = sessionId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `run-${slug}` : undefined;
}

export const runLogHandler: HookHandler = {
  name: "run-log",
  event: "Stop",
  overrideGate: null,
  explain: EXPLAIN,
  async run(input: HookInput): Promise<HookDecision> {
    const cwd = input.cwd ?? process.cwd();
    const boundary = input.hook_event_name === "SubagentStop" ? "subagent-stop" : "stop";
    const state = readState(cwd);
    try {
      const sessionId = typeof input.session_id === "string" ? input.session_id : undefined;
      const writer = await EventStreamWriter.open(cwd, { runId: runIdFromSession(sessionId) });
      await writer.append({
        kind: "session-boundary",
        boundary,
        agent: typeof input.agent_type === "string" ? input.agent_type : "butler",
        ...(state && typeof state.phase === "number" ? { phase: state.phase } : {}),
        ...(state ? { lane: state.lane } : {}),
        ...extractUsage(input), // model + tokens where the runtime exposes them (WS7)
      });
      await writer.close();
    } catch {
      // Fail-open: never wedge a stop because logging failed.
    }
    return { kind: "none" };
  },
};
