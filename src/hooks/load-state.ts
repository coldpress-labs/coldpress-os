/**
 * `load-state` — SessionStart hook (action plan §4.4, first row).
 *
 * Injects a compact (~150-token) orchestration summary at session start so
 * Butler resumes with lane/phase/gates/enforcement in context without re-reading
 * the whole project. Reads `.coldpress/state.yaml` (the §4.1 routing spine);
 * emits nothing when there is no state yet (uninitialized project) so a brand-new
 * session is not polluted.
 *
 * Non-blocking by design: a SessionStart hook cannot deny anything, and a
 * malformed/absent state must never break session start — worst case it injects
 * a short "state unreadable" note so Butler knows to repair it.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { StateSchema, type State } from "../../schemas/state.schema.js";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

const EXPLAIN = `load-state (SessionStart)
Injects a ~150-token orchestration summary from .coldpress/state.yaml at the
start of every session: lane, current phase + status, security tier, enforcement
mode, iteration, and a per-phase gate snapshot. Read-only; never blocks. Emits
nothing when no state.yaml exists yet (fresh/uninitialized project).
Source of truth: schemas/state.schema.ts (§4.1). Not overridable (nothing to
override — it only adds context).`;

/** Build the compact context string from validated state. */
export function summarizeState(state: State): string {
  const lines: string[] = ["coldpress: orchestration state (.coldpress/state.yaml)"];
  const phase = typeof state.phase === "number" ? `Phase ${state.phase}` : `Lite:${state.phase}`;
  lines.push(
    `- lane: ${state.lane} · ${phase} (${state.phase_status}) · tier ${state.security_tier} · enforcement ${state.enforcement}` +
      (state.iteration ? ` · iteration ${state.iteration}` : ""),
  );

  if (state.active_stories.length > 0) {
    lines.push(`- active stories: ${state.active_stories.join(", ")}`);
  }

  const openDeltas = Object.entries(state.deltas_open).filter(([, n]) => n > 0);
  if (openDeltas.length > 0) {
    lines.push(`- open deltas: ${openDeltas.map(([k, n]) => `${k}=${n}`).join(", ")}`);
  }

  // Gate snapshot for the current phase (full lane) — surface unmet required keys.
  const gateKey = typeof state.phase === "number" ? `p${state.phase}` : state.phase;
  const gate = state.gates[gateKey];
  if (gate) {
    const unmet = Object.entries(gate)
      .filter(([, v]) => v === false)
      .map(([k]) => k);
    if (unmet.length > 0) {
      lines.push(`- ${gateKey} gates NOT yet met: ${unmet.join(", ")}`);
    }

    // VP2 O38: parked on a closed gate. If the phase you are STILL IN has already
    // been exited, further work is a new iteration — not a continuation. Left
    // unsaid, the exit stamp quietly becomes fiction while development continues
    // (VP2: nine days of feature work under a gate closed on day one). Surface it
    // at session start and route to the re-entry patterns the framework already
    // ships — they existed, but nothing ever pointed anyone at them.
    if (typeof gate.exited === "string" && gate.exited.length > 0) {
      lines.push(
        `- ⚠ ${gateKey} is already EXITED (${gate.exited}) but the project is still on ${phase}. ` +
          `More work here is a NEW ITERATION, not a continuation: reopen the phase (archive the exit, ` +
          `bump \`iteration\`) and re-earn the gate. See coldpress-os/docs/cross-cutting/phase-reentry-patterns.md. ` +
          `Never keep building under a closed gate.`,
      );
    }
  }

  if (state.deploy?.pack) {
    lines.push(
      `- deploy: pack ${state.deploy.pack}` +
        (state.deploy.staging_smoke != null ? ` · staging ${String(state.deploy.staging_smoke)}` : "") +
        (state.deploy.prod != null ? ` · prod ${String(state.deploy.prod)}` : ""),
    );
  }

  // TODO(WS3/§7.7): once the human-gates registry exists, append the pending
  // human gate for the current phase here.
  return lines.join("\n");
}

export const loadStateHandler: HookHandler = {
  name: "load-state",
  event: "SessionStart",
  overrideGate: null,
  explain: EXPLAIN,
  run(input: HookInput): HookDecision {
    const cwd = input.cwd ?? process.cwd();
    const statePath = join(cwd, ".coldpress", "state.yaml");
    if (!existsSync(statePath)) {
      return { kind: "none" };
    }
    let parsed: unknown;
    try {
      parsed = parseYaml(readFileSync(statePath, "utf8"));
    } catch {
      return {
        kind: "context",
        text: "coldpress: .coldpress/state.yaml exists but could not be parsed as YAML — Butler should inspect/repair it before relying on phase routing.",
      };
    }
    const result = StateSchema.safeParse(parsed);
    if (!result.success) {
      const first = result.error.issues[0];
      return {
        kind: "context",
        text: `coldpress: .coldpress/state.yaml failed schema validation (${first ? `${first.path.join(".")}: ${first.message}` : "shape error"}). Butler should repair it — orchestration routing is unreliable until then.`,
      };
    }
    return { kind: "context", text: summarizeState(result.data) };
  },
};
