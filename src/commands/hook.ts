/**
 * `coldpress hook <name>` — the enforcement-hook dispatcher (§4.4, WS1).
 *
 * Invoked by the thin `scripts/hooks/<name>.mjs` wrappers that
 * `.claude/settings.json` wires to Claude Code hook events. Reads the hook
 * payload JSON on stdin, runs the named handler, applies the COLDPRESS_OVERRIDE
 * escape hatch (G11), and emits the Claude Code decision JSON + exit code.
 *
 * Fail-open on internal error (unknown hook, handler throw): a broken hook must
 * never wedge the user's session — it degrades to "no opinion" and `coldpress
 * doctor` (§7.11 hook health) surfaces the breakage. Enforcement failing closed
 * would block all edits on any hook bug.
 */

import { getHook } from "../hooks/registry.js";
import { recordGateOverride } from "../hooks/run-log.js";
import { logOverride, parseOverride, renderDecision } from "../hooks/types.js";
import type { HookHandler, HookInput } from "../hooks/types.js";

export interface RunHookOptions {
  /** Print the hook's `--explain` text and exit, without reading stdin. */
  explain?: boolean;
  /**
   * Pre-supplied payload (tests). When omitted, the payload is read from
   * stdin as JSON.
   */
  input?: HookInput;
  /** Injected env for override parsing (tests). Defaults to process.env. */
  env?: NodeJS.ProcessEnv;
  /** Injected stdout/stderr writers (tests). */
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
  /** Inject a handler directly, bypassing the registry (tests). */
  handler?: HookHandler;
}

async function readStdin(): Promise<string> {
  // No piped input (interactive TTY) — treat as empty payload.
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Run a hook by name. Returns the process exit code (0 = proceed/allow or a
 * decision was emitted on stdout; non-zero reserved — this harness prefers JSON
 * decisions at exit 0 per the Claude Code contract).
 */
export async function runHook(name: string, opts: RunHookOptions = {}): Promise<number> {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));

  const handler = opts.handler ?? getHook(name);
  if (!handler) {
    warn(`coldpress hook: unknown hook "${name}". Known: run \`coldpress hook --list\`.\n`);
    return 0; // fail-open — do not wedge the session on a mis-wired hook
  }

  if (opts.explain) {
    write(handler.explain.endsWith("\n") ? handler.explain : `${handler.explain}\n`);
    return 0;
  }

  let input: HookInput = opts.input ?? {};
  if (!opts.input) {
    const raw = await readStdin();
    if (raw.trim()) {
      try {
        input = JSON.parse(raw) as HookInput;
      } catch {
        // Malformed payload — degrade to empty; handlers tolerate missing fields.
        input = {};
      }
    }
  }

  let decision;
  try {
    decision = await handler.run(input);
  } catch (e) {
    warn(`coldpress hook "${name}" errored (degrading to no-op): ${e instanceof Error ? e.message : String(e)}\n`);
    return 0; // fail-open
  }

  // COLDPRESS_OVERRIDE escape hatch (G11): only an actual deny is overridable,
  // and only with a matching, reasoned directive. Logged loudly.
  if (decision.kind === "deny" && handler.overrideGate) {
    const override = parseOverride(handler.overrideGate, opts.env);
    if (override) {
      logOverride(override, warn);
      warn(`   Overridden decision was: ${decision.reason}\n`);
      // Record the bypass to the EventStream (fail-open) so `coldpress evolve`
      // can rank frequently-overridden gates. Loud stderr + durable event.
      await recordGateOverride(input, override);
      return 0; // allow — defer to normal flow
    }
  }

  const { stdout } = renderDecision(decision, handler.event);
  if (stdout) write(stdout);
  return 0;
}
