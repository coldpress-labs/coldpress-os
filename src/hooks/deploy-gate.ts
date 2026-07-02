/**
 * `deploy-gate` — PreToolUse(Skill) hook (action plan §5 P9 / §9 WS6).
 *
 * The second, independent guard on production deploys. `deploy-prod` already
 * carries `disable-model-invocation` (the model never auto-fires it); this hook
 * blocks it — even on explicit invocation — unless the release preconditions
 * hold in `.coldpress/state.yaml`:
 *
 *   1. Build + verification complete — full lane: `gates.p8` green or phase ≥ 9;
 *      lite lane: `gates.verify` green or phase `ship`.
 *   2. Staging smoke green — `deploy.staging_smoke` is a green/pass value (the
 *      `smoke` skill records it after `deploy-staging`).
 *   3. Acceptance record present — only when required (client projects set
 *      `deploy.requires_acceptance`): an acceptance record must exist under
 *      `_context/operations/acceptance/` (the WS6-E UAT flow writes it).
 *
 * Only `deploy-prod` is gated; every other skill passes through. Overridable
 * via COLDPRESS_OVERRIDE="deploy-gate:<reason>" (loudly logged) — a prod deploy
 * you must explain in writing.
 */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isGateGreen, skillNameFromInput } from "./phase-gate.js";
import { readState } from "./state-io.js";
import type { State } from "../../schemas/state.schema.js";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

const EXPLAIN = `deploy-gate (PreToolUse: Skill) — production deploy guard
Blocks the \`deploy-prod\` skill unless, in .coldpress/state.yaml:
  1. build+verify complete (full: gates.p8 green / phase ≥ 9; lite: gates.verify / phase 'ship'),
  2. staging smoke is green (deploy.staging_smoke), and
  3. an acceptance record exists when required (deploy.requires_acceptance → _context/operations/acceptance/).
The second guard on top of deploy-prod's disable-model-invocation.
Override (logged): COLDPRESS_OVERRIDE="deploy-gate:<reason>".`;

const GREEN = new Set([true, "green", "pass", "passed", "ok"]);

function isGreen(v: unknown): boolean {
  return GREEN.has(v as never);
}

/** True if any acceptance record exists under `_context/operations/acceptance/`. */
export function hasAcceptanceRecord(cwd: string): boolean {
  const dir = join(cwd, "_context", "operations", "acceptance");
  try {
    return readdirSync(dir).some((f) => /\.(md|ya?ml|json)$/.test(f));
  } catch {
    return false;
  }
}

/** Decide whether `deploy-prod` may run, given state. Pure — for testing. */
export function decideDeployGate(state: State, cwd: string): HookDecision {
  const reasons: string[] = [];

  const buildComplete =
    state.lane === "full"
      ? isGateGreen(state.gates.p8) || (typeof state.phase === "number" && state.phase >= 9)
      : isGateGreen(state.gates.verify) || state.phase === "ship";
  if (!buildComplete) {
    reasons.push("build + verification are not complete (Phase 8 / lite Verify must be green)");
  }

  if (!isGreen(state.deploy?.staging_smoke)) {
    reasons.push("staging smoke is not green — run `deploy-staging` then `smoke` and record the result first");
  }

  // Acceptance record — only enforced when the project declares it needs one
  // (client work; the WS6-E UAT flow sets deploy.requires_acceptance).
  const requiresAcceptance = Boolean((state.deploy as Record<string, unknown>)?.requires_acceptance);
  if (requiresAcceptance && !hasAcceptanceRecord(cwd)) {
    reasons.push("no acceptance record — client UAT sign-off is required before production (see _context/operations/acceptance/)");
  }

  if (reasons.length === 0) return { kind: "none" };
  return {
    kind: "deny",
    reason:
      `Blocked: production deploy preconditions not met — ${reasons.join("; ")}. ` +
      `Production deploys are human-triggered AND gated. ` +
      `Override (logged): COLDPRESS_OVERRIDE="deploy-gate:<reason>".`,
  };
}

export const deployGateHandler: HookHandler = {
  name: "deploy-gate",
  event: "PreToolUse",
  overrideGate: "deploy-gate",
  explain: EXPLAIN,
  run(input: HookInput): HookDecision {
    if (skillNameFromInput(input) !== "deploy-prod") return { kind: "none" };
    const state = readState(input.cwd ?? process.cwd());
    if (!state) return { kind: "none" }; // no state → can't gate (fail open, like phase-gate)
    return decideDeployGate(state, input.cwd ?? process.cwd());
  },
};
