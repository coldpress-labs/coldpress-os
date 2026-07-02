/**
 * `quality-gate` — Stop hook (action plan §4.4). "The single highest-leverage
 * change in this plan": a session cannot COMPLETE while the project's quality
 * checks are red.
 *
 * v0.4/WS1 scope: runs the checks present in the project's `package.json`
 * scripts — `typecheck`, `lint`, `test` (fast→slow). Any non-zero exit blocks
 * stopping (decision:block) with the failing check named, so the agent fixes it
 * before completing. WS4 replaces script-detection with the stack pack's
 * `testing.yaml` (layers L0–L7). Overridable via
 * COLDPRESS_OVERRIDE="quality-gate:<reason>" (loudly logged).
 *
 * Only projects that actually define these scripts are gated; a project with no
 * checks (or no package.json) passes through.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

/** Ordered fast→slow — cheapest signal first. */
const CANDIDATE_CHECKS = ["typecheck", "lint", "test"] as const;

const EXPLAIN = `quality-gate (Stop)
Blocks session completion while the project's quality checks are red. Runs the
package.json scripts among {typecheck, lint, test} that exist (fast→slow); any
failure prevents stopping and reports which check failed, so it is fixed before
completing. Projects with no such scripts pass through. (WS4 swaps script
detection for the stack pack's testing.yaml.) Override (logged):
COLDPRESS_OVERRIDE="quality-gate:<reason>".`;

/** Which of the candidate checks the project actually defines. */
export function detectChecks(cwd: string): string[] {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return [];
  let scripts: Record<string, unknown> = {};
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { scripts?: Record<string, unknown> };
    scripts = pkg.scripts ?? {};
  } catch {
    return [];
  }
  return CANDIDATE_CHECKS.filter((c) => typeof scripts[c] === "string");
}

export interface CheckResult {
  name: string;
  ok: boolean;
}

/** A check runner — injectable for tests. Real impl spawns `npm run <script>`. */
export type CheckRunner = (script: string, cwd: string) => boolean;

const npmRunner: CheckRunner = (script, cwd) => {
  const r = spawnSync("npm", ["run", "--silent", script], { cwd, stdio: "ignore" });
  return r.status === 0;
};

/** Run each check; short-circuits on the first failure (cheapest-first order). */
export function runQualityChecks(cwd: string, checks: string[], run: CheckRunner): CheckResult[] {
  const results: CheckResult[] = [];
  for (const name of checks) {
    const ok = run(name, cwd);
    results.push({ name, ok });
    if (!ok) break; // fail fast — the agent fixes this one, then re-stops
  }
  return results;
}

/** Factory so tests can inject a fake runner; the default uses npm. */
export function makeQualityGate(run: CheckRunner = npmRunner): HookHandler {
  return {
    name: "quality-gate",
    event: "Stop",
    overrideGate: "quality-gate",
    explain: EXPLAIN,
    run(input: HookInput): HookDecision {
      const cwd = input.cwd ?? process.cwd();
      const checks = detectChecks(cwd);
      if (checks.length === 0) return { kind: "none" };
      const results = runQualityChecks(cwd, checks, run);
      const failed = results.find((r) => !r.ok);
      if (!failed) return { kind: "none" };
      return {
        kind: "deny",
        reason:
          `Cannot complete: quality check "${failed.name}" is failing (\`npm run ${failed.name}\`). ` +
          `Fix it and re-run before finishing. ` +
          `Override (logged): COLDPRESS_OVERRIDE="quality-gate:<reason>".`,
      };
    },
  };
}

export const qualityGateHandler: HookHandler = makeQualityGate();
