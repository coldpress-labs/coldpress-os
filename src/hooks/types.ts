/**
 * Hook harness — shared types, the COLDPRESS_OVERRIDE protocol, and emit
 * helpers for the enforcement layer (action plan §4.4, WS1).
 *
 * Execution model (decided WS1): `.claude/settings.json` wires each Claude
 * Code hook event to a thin, dep-free `scripts/hooks/<name>.mjs` wrapper that
 * forwards stdin to `coldpress hook <name>`. The real logic lives here in
 * `src/hooks/*` — unit-tested via vitest, reusing existing `src/` machinery
 * (gate checks, schema validators, EventStream). Each hook: <2s, `--explain`,
 * and honors `COLDPRESS_OVERRIDE` with loud logging, from hook #1 (G11).
 *
 * The Claude Code hook I/O contract implemented here (verified against
 * code.claude.com/docs/en/hooks):
 *   - Hooks receive the event JSON on stdin.
 *   - A PreToolUse hook denies via stdout JSON
 *     `{hookSpecificOutput:{hookEventName, permissionDecision:"deny",
 *     permissionDecisionReason}}` at exit 0 (preferred over exit 2).
 *   - A SessionStart hook injects context via stdout JSON
 *     `{hookSpecificOutput:{hookEventName, additionalContext}}`.
 *   - Exit 0 + no JSON = no opinion (defer to normal flow).
 */

/** The subset of the Claude Code hook stdin payload the harness consumes. */
export interface HookInput {
  hook_event_name?: string;
  /** Project root the session is running in. */
  cwd?: string;
  /** SessionStart: "startup" | "resume" | "clear" | "compact". */
  source?: string;
  /** PreToolUse / PostToolUse: the tool being called. */
  tool_name?: string;
  /** Tool parameters — `file_path` for Edit/Write, `command` for Bash, etc. */
  tool_input?: Record<string, unknown>;
  /** Dispatching subagent slug, when the tool call is from a subagent. */
  agent_type?: string;
  agent_id?: string;
  /** Allow forward-compatible fields without failing. */
  [key: string]: unknown;
}

/**
 * A hook's decision, runtime-agnostic. `emit()` maps it to the correct
 * Claude Code stdout JSON + exit code for the hook's event.
 */
export type HookDecision =
  /**
   * Block / object, with a reason. Renders per-event:
   *   - PreToolUse: deny the tool call (permissionDecision: "deny").
   *   - PostToolUse: feed the reason back to the model (decision: "block") —
   *     the action already ran, so this is corrective feedback, not a block.
   *   - Stop/SubagentStop: prevent stopping (decision: "block") — e.g.
   *     quality-gate red = cannot complete.
   */
  | { kind: "deny"; reason: string }
  /** SessionStart/UserPromptSubmit: inject additional context into the session. */
  | { kind: "context"; text: string }
  /** No opinion — defer to normal flow (exit 0, no output). */
  | { kind: "none" };

/** One enforcement hook. `run` is pure w.r.t. its input (+ filesystem under cwd). */
export interface HookHandler {
  /** Dispatch name — `coldpress hook <name>`. */
  name: string;
  /** The Claude Code event this hook is wired to (for emit() + docs). */
  event: "SessionStart" | "PreToolUse" | "PostToolUse" | "Stop" | "SubagentStop";
  /**
   * The gate id used in COLDPRESS_OVERRIDE="<gate>:<reason>" and in override
   * logging. null for non-blocking hooks (SessionStart, run-log) that have
   * nothing to override.
   */
  overrideGate: string | null;
  /** `--explain` output — the governance documentation for this hook (§4.4). */
  explain: string;
  /** Evaluate the hook. Returns a runtime-agnostic decision. */
  run(input: HookInput): Promise<HookDecision> | HookDecision;
}

/** A parsed COLDPRESS_OVERRIDE directive. */
export interface OverrideDirective {
  gate: string;
  reason: string;
}

/**
 * Parse `COLDPRESS_OVERRIDE="<gate>:<reason>"` and return the directive iff it
 * targets `gate`. The value is `<gate>:<free-text reason>` — split on the FIRST
 * colon only, so reasons may contain colons. An override with an empty reason
 * does NOT apply (a reason is mandatory — you must say why, G11).
 *
 * @param gate  the hook's override gate id
 * @param env   process env (injectable for tests)
 */
export function parseOverride(
  gate: string | null,
  env: NodeJS.ProcessEnv = process.env,
): OverrideDirective | null {
  if (!gate) return null;
  const raw = env.COLDPRESS_OVERRIDE;
  if (!raw) return null;
  const idx = raw.indexOf(":");
  if (idx <= 0) return null; // need "<gate>:<reason>" with a non-empty gate
  const targetGate = raw.slice(0, idx).trim();
  const reason = raw.slice(idx + 1).trim();
  if (targetGate !== gate || reason.length === 0) return null;
  return { gate: targetGate, reason };
}

/**
 * Loud override logging (G11). Writes a prominent line to stderr so the bypass
 * surfaces in the session and the hook's own logs. The dispatcher
 * (`src/commands/hook.ts`) ALSO appends a durable `gate-override` event to the
 * EventStream (via `recordGateOverride`), which `coldpress evolve` aggregates
 * into the override leaderboard — a frequently-overridden gate is a mis-designed
 * gate. (`_context/audit/decisions.md` mirroring remains a follow-up.)
 */
export function logOverride(directive: OverrideDirective, writer: (s: string) => void = (s) => process.stderr.write(s)): void {
  writer(
    `⚠️  COLDPRESS_OVERRIDE ACTIVE — gate "${directive.gate}" bypassed. Reason: ${directive.reason}\n` +
      `   (This is logged; frequent overrides of the same gate signal a mis-designed gate — see \`coldpress evolve\`.)\n`,
  );
}

/**
 * Map a HookDecision to the Claude Code stdout JSON + process exit code for the
 * hook's event, using the verified contract. Returns the payload string (or
 * null when there is nothing to print) and the exit code.
 */
export function renderDecision(
  decision: HookDecision,
  event: HookHandler["event"],
): { stdout: string | null; exitCode: number } {
  switch (decision.kind) {
    case "deny":
      if (event === "PreToolUse") {
        // Preferred PreToolUse form: deny the tool call before it runs.
        return {
          stdout: JSON.stringify({
            hookSpecificOutput: {
              hookEventName: event,
              permissionDecision: "deny",
              permissionDecisionReason: decision.reason,
            },
          }),
          exitCode: 0,
        };
      }
      // PostToolUse (corrective feedback — action already ran) and Stop/
      // SubagentStop (prevent stopping): the cross-event block form.
      return { stdout: JSON.stringify({ decision: "block", reason: decision.reason }), exitCode: 0 };
    case "context":
      return {
        stdout: JSON.stringify({
          hookSpecificOutput: {
            hookEventName: event,
            additionalContext: decision.text,
          },
        }),
        exitCode: 0,
      };
    case "none":
      return { stdout: null, exitCode: 0 };
  }
}
