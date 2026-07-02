/**
 * `phase-gate` — PreToolUse(Skill) hook (action plan §4.4). FULL LANE ONLY.
 *
 * Blocks a phase-N lifecycle skill from running before phase N-1's gates are
 * green in `.coldpress/state.yaml` — you cannot skip ahead. The lite lane drops
 * phase sequencing (§6), so this hook is a no-op there.
 *
 * A skill's phase is resolved from the framework's `lifecycle/<N>-<name>/<skill>/`
 * layout (the installed @coldpress/core). Atomic (non-lifecycle) skills and
 * unresolved names pass through. "Green" for p(N-1) means: the gate ledger entry
 * exists, has no `false` values, and carries an `exited` marker — OR the project
 * is already at/past phase N (backfilling an earlier-phase skill is allowed).
 *
 * Overridable via COLDPRESS_OVERRIDE="phase-gate:<reason>" (loudly logged).
 */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { packageRoot } from "../utils/paths.js";
import { readState } from "./state-io.js";
import type { GateLedgerEntry, State } from "../../schemas/state.schema.js";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

const EXPLAIN = `phase-gate (PreToolUse: Skill) — full lane only
Blocks a phase-N lifecycle skill until phase N-1's gates are green in
.coldpress/state.yaml (no skipping ahead). Atomic skills and lite-lane projects
pass through. "Green" = the p(N-1) gate ledger exists, has no false values, and
carries an 'exited' marker (or the project is already at/past phase N).
Override (logged): COLDPRESS_OVERRIDE="phase-gate:<reason>".`;

let skillPhaseMap: Map<string, number> | null = null;

/** Build (once) a map of lifecycle skill name → phase number from the framework tree. */
export function getSkillPhaseMap(root: string = packageRoot): Map<string, number> {
  if (skillPhaseMap) return skillPhaseMap;
  const map = new Map<string, number>();
  const lifecycleDir = join(root, "lifecycle");
  if (existsSync(lifecycleDir)) {
    for (const phaseDir of safeReaddir(lifecycleDir)) {
      const m = /^(\d+)-/.exec(phaseDir);
      if (!m) continue;
      const phase = Number(m[1]);
      for (const skillDir of safeReaddir(join(lifecycleDir, phaseDir))) {
        if (!map.has(skillDir)) map.set(skillDir, phase);
      }
    }
  }
  skillPhaseMap = map;
  return map;
}

/** Test seam — clear the memoized map. */
export function _resetSkillPhaseMap(): void {
  skillPhaseMap = null;
}

function safeReaddir(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

/** Extract the invoked skill's name from the Skill tool input. */
export function skillNameFromInput(input: HookInput): string | undefined {
  const ti = input.tool_input ?? {};
  for (const key of ["skill", "name", "skill_name", "command"]) {
    const v = ti[key];
    if (typeof v === "string" && v.trim()) return v.trim().split(/[\s/]/).pop();
  }
  return undefined;
}

/** Is the previous phase's gate ledger entry "green"? */
export function isGateGreen(entry: GateLedgerEntry | undefined): boolean {
  if (!entry) return false;
  const values = Object.entries(entry);
  const hasExited = values.some(([k, v]) => k === "exited" && Boolean(v));
  const noFalse = values.every(([, v]) => v !== false);
  return hasExited && noFalse;
}

/** Decide whether a phase-N skill may run, given state. Pure — for testing. */
export function decidePhaseGate(state: State, phase: number): HookDecision {
  if (state.lane !== "full") return { kind: "none" };
  if (phase <= 1) return { kind: "none" };
  // Already at/past this phase → backfilling an earlier-phase skill is fine.
  if (typeof state.phase === "number" && state.phase >= phase) return { kind: "none" };
  if (isGateGreen(state.gates[`p${phase - 1}`])) return { kind: "none" };
  return {
    kind: "deny",
    reason:
      `Blocked: this is a Phase ${phase} skill, but Phase ${phase - 1}'s gates are not yet green ` +
      `in .coldpress/state.yaml. Complete Phase ${phase - 1} (its exit gate) before starting Phase ${phase}. ` +
      `Override (logged): COLDPRESS_OVERRIDE="phase-gate:<reason>".`,
  };
}

export const phaseGateHandler: HookHandler = {
  name: "phase-gate",
  event: "PreToolUse",
  overrideGate: "phase-gate",
  explain: EXPLAIN,
  run(input: HookInput): HookDecision {
    const skill = skillNameFromInput(input);
    if (!skill) return { kind: "none" };
    const phase = getSkillPhaseMap().get(skill);
    if (phase === undefined) return { kind: "none" }; // atomic / unknown skill
    const state = readState(input.cwd ?? process.cwd());
    if (!state) return { kind: "none" }; // no state → can't gate
    return decidePhaseGate(state, phase);
  },
};
