/**
 * `coldpress statusline` (§7.7) — the one-line orchestration status Claude Code
 * renders at the bottom of the session. Reads `.coldpress/state.yaml` and prints
 * lane · phase · status · tier · enforcement, plus the current phase's unmet gate
 * keys. Wired via `.claude/settings.json` `statusLine`.
 *
 * (The pending-human-gate field activates with the human-gates registry, §7.7.)
 */

import { readState } from "../hooks/state-io.js";

export interface RunStatusLineOptions {
  projectDir?: string;
  stdout?: (s: string) => void;
}

export function runStatusLine(opts: RunStatusLineOptions = {}): number {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const cwd = opts.projectDir ?? process.cwd();
  const state = readState(cwd);
  if (!state) {
    write("⬡ coldpress: no state (run `coldpress init`)");
    return 0;
  }

  const phase = typeof state.phase === "number" ? `P${state.phase}` : `lite:${state.phase}`;
  const parts = [
    `⬡ ${state.lane}`,
    `${phase} ${state.phase_status}`,
    `${state.security_tier}`,
    `enf:${state.enforcement}`,
  ];

  // Surface unmet required gate keys for the current phase, if any.
  const gateKey = typeof state.phase === "number" ? `p${state.phase}` : String(state.phase);
  const gate = state.gates[gateKey];
  if (gate) {
    const unmet = Object.entries(gate)
      .filter(([, v]) => v === false)
      .map(([k]) => k);
    if (unmet.length > 0) parts.push(`gate:${unmet.length} unmet`);
  }

  write(parts.join(" · "));
  return 0;
}
