/**
 * `quality-gate` — Stop hook (action plan §4.4). "The single highest-leverage
 * change in this plan": a session cannot COMPLETE while the project's quality
 * checks are red.
 *
 * The gate is driven by the stack pack's `testing.yaml` (layers L0–L7) when the
 * project has one: the Stop gate runs the FAST layers only — L0 static
 * (typecheck + lint) and L1 unit (test) — because a Stop hook must stay <2s;
 * the heavier layers L2–L7 (integration/e2e/visual/a11y/perf) are the verifier's
 * + readiness's job, not every session-stop. testing.yaml decides WHICH layers
 * gate; the project's package.json scripts are what execute them (testing.yaml
 * declares tools, not commands). When no testing.yaml is present, the gate falls
 * back to detecting {typecheck, lint, test} scripts directly (v0.4/WS1 behavior).
 *
 * Any non-zero exit blocks stopping (decision:block) with the failing check
 * named, so the agent fixes it before completing. Projects with no checks (or no
 * package.json) pass through. Overridable via
 * COLDPRESS_OVERRIDE="quality-gate:<reason>" (loudly logged).
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { TestingSchema } from "../../schemas/testing.schema.js";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

/** Ordered fast→slow — cheapest signal first. */
const CANDIDATE_CHECKS = ["typecheck", "lint", "test"] as const;

/**
 * Fast testing layers the Stop gate runs, mapped to the package.json scripts
 * that execute them. L0 static → typecheck + lint; L1 unit → test. L2–L7 are
 * excluded here by design (verifier/readiness own them — too slow for a Stop).
 */
const FAST_LAYER_SCRIPTS: Record<string, readonly string[]> = {
  L0: ["typecheck", "lint"],
  L1: ["test"],
};

/** Conventional locations a project's testing.yaml may live. */
const TESTING_YAML_PATHS = ["_context/testing/testing.yaml", "testing.yaml"] as const;

const EXPLAIN = `quality-gate (Stop)
Blocks session completion while the project's quality checks are red. Driven by
the stack pack's testing.yaml when present: runs the FAST layers only — L0 static
(typecheck + lint) and L1 unit (test); L2–L7 are the verifier's job. testing.yaml
picks the layers; package.json scripts run them. With no testing.yaml, falls back
to detecting {typecheck, lint, test} scripts. Any failure prevents stopping and
names the failing check. Projects with no such scripts pass through. Override
(logged): COLDPRESS_OVERRIDE="quality-gate:<reason>".`;

/** package.json scripts the project defines (empty on missing/unparseable). */
function packageScripts(cwd: string): Record<string, unknown> {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return {};
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { scripts?: Record<string, unknown> };
    return pkg.scripts ?? {};
  } catch {
    return {};
  }
}

/**
 * The enabled FAST layers (L0/L1) from the project's testing.yaml, or null when
 * no valid testing.yaml exists. A layer with `enabled: false` is excluded.
 */
export function readFastLayers(cwd: string): string[] | null {
  for (const rel of TESTING_YAML_PATHS) {
    const p = join(cwd, rel);
    if (!existsSync(p)) continue;
    let parsed;
    try {
      parsed = TestingSchema.safeParse(parseYaml(readFileSync(p, "utf8")));
    } catch {
      return null; // present but unreadable → fall back to script detection
    }
    if (!parsed.success) return null;
    return Object.entries(parsed.data.layers)
      .filter(([layer, cfg]) => layer in FAST_LAYER_SCRIPTS && cfg.enabled !== false)
      .map(([layer]) => layer);
  }
  return null;
}

/**
 * The checks the Stop gate will run. testing.yaml-driven when a valid one exists
 * (the enabled fast layers → their scripts, intersected with scripts that are
 * actually defined); otherwise the plain {typecheck, lint, test} detection.
 */
export function detectChecks(cwd: string): string[] {
  const scripts = packageScripts(cwd);
  const has = (s: string) => typeof scripts[s] === "string";

  const fastLayers = readFastLayers(cwd);
  if (fastLayers !== null) {
    // Layer-driven: only the scripts implied by enabled fast layers, and only
    // those the project actually defines (can't `npm run` a missing script).
    const wanted = new Set<string>();
    for (const layer of fastLayers) for (const s of FAST_LAYER_SCRIPTS[layer] ?? []) wanted.add(s);
    return CANDIDATE_CHECKS.filter((c) => wanted.has(c) && has(c));
  }

  // Fallback (no testing.yaml): detect the candidate scripts directly.
  return CANDIDATE_CHECKS.filter((c) => has(c));
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
