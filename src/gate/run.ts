/**
 * Gate-runner (WS10-C1). The system-integration audit found `src/gate/checks/*`
 * (the 8 check functions, all CLI-wired) had ZERO runtime callers: nothing read a
 * phase's `gate.json` and executed its `command` strings — the phase-gate hook
 * only checked the state ledger's booleans, and the acceptance checks were run by
 * "agents reading prose".
 *
 * This is the engine that closes that: `coldpress gate check <phase>` reads
 * `lifecycle/<phase>/gate.json`, evaluates each acceptance check (running its
 * `command` via the CLI, or existence-checking an `artefact-present` path), and
 * reports + optionally records the aggregate to `.coldpress/state.yaml`. Checks it
 * cannot auto-evaluate (human sign-off, skill_ref-only, conditional, or a command
 * with an unresolvable `{…}` placeholder) are surfaced as `pending`, not silently
 * passed — honest about what still needs a human/agent.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { packageRoot } from "../utils/paths.js";

export interface GateCheckOutcome {
  id: string;
  severity: string;
  kind: string;
  status: "pass" | "fail" | "pending";
  detail: string;
}

export interface GateRunReport {
  phase: number;
  gate_id: string;
  results: GateCheckOutcome[];
  /** True when a block-severity check was evaluated and FAILED. */
  blocked: boolean;
  /** Count of checks that could not be auto-evaluated (human/agent/needs-context). */
  pending: number;
  /** Count of checks actually run (command or artefact-present). */
  evaluated: number;
}

/** Runs a `coldpress <args>` invocation in the project dir → exit code. Injectable for tests. */
export type GateCommandRunner = (args: string[], cwd: string) => number;

const defaultRunner: GateCommandRunner = (args, cwd) => {
  const cli = resolve(packageRoot, "dist/cli.js");
  const r = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });
  return r.status ?? 1;
};

interface AcceptanceCheck {
  id: string;
  severity?: string;
  kind?: string;
  command?: string;
  artefact_path?: string;
}
interface GateJson {
  gate_id: string;
  acceptance_checks: AcceptanceCheck[];
}

/** Find the gate.json under `lifecycle/<phase>-<slug>/` (e.g. `lifecycle/3-tech-stack/gate.json`). */
export function findGateJson(phase: number, frameworkDir: string): string | undefined {
  const lifecycle = join(frameworkDir, "lifecycle");
  if (!existsSync(lifecycle)) return undefined;
  const dir = readdirSync(lifecycle).find((d) => new RegExp(`^${phase}-`).test(d));
  if (!dir) return undefined;
  const gate = join(lifecycle, dir, "gate.json");
  return existsSync(gate) ? gate : undefined;
}

/**
 * Resolve `{…}` placeholders in a gate command against the project.
 *   `{date}` → today (YYYY-MM-DD). `{latest}` / `{N}` → the highest-versioned
 *   `…-v<num>…` file that exists. Returns null when a placeholder can't be
 *   resolved (→ the check is reported `pending`, not run). `*` globs are left
 *   for the underlying command to expand.
 */
/** Escape a string for literal use inside a RegExp. */
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function resolvePlaceholders(command: string, projectDir: string, today: string): string | null {
  let out = command.replace(/\{date\}/g, today);
  // Resolve {latest}/{N} in a versioned path token by globbing the -v<num> family.
  const versionTokenRe = /(\S*?-v)\{(?:latest|N)\}(\S*)/g;
  out = out.replace(versionTokenRe, (_m, prefix: string, suffix: string) => {
    const abs = resolve(projectDir, prefix);
    const dir = dirname(abs);
    const base = basename(prefix); // e.g. "stack-shortlist-v"
    if (!existsSync(dir)) return `${prefix}{UNRESOLVED}${suffix}`;
    const fileRe = new RegExp("^" + escapeRe(base) + "(\\d+)" + escapeRe(suffix) + "$");
    const versions = readdirSync(dir)
      .map((f) => {
        const m = f.match(fileRe);
        return m ? { file: f, n: Number(m[1]) } : null;
      })
      .filter((x): x is { file: string; n: number } => x !== null)
      .sort((a, b) => b.n - a.n);
    if (versions.length === 0) return `${prefix}{UNRESOLVED}${suffix}`;
    return join(dirname(prefix), versions[0]!.file);
  });
  return out.includes("{") ? null : out;
}

export function runGate(
  phase: number,
  opts: { projectDir?: string; frameworkDir?: string; run?: GateCommandRunner; today?: string } = {},
): GateRunReport {
  const projectDir = opts.projectDir ?? process.cwd();
  const frameworkDir = opts.frameworkDir ?? packageRoot;
  const run = opts.run ?? defaultRunner;
  const today = opts.today ?? new Date().toISOString().slice(0, 10);

  const gatePath = findGateJson(phase, frameworkDir);
  if (!gatePath) {
    return { phase, gate_id: `phase-${phase}-exit`, results: [], blocked: false, pending: 0, evaluated: 0 };
  }
  const gate = JSON.parse(readFileSync(gatePath, "utf8")) as GateJson;

  const results: GateCheckOutcome[] = [];
  let blocked = false;
  let pending = 0;
  let evaluated = 0;

  for (const c of gate.acceptance_checks) {
    const severity = c.severity ?? "block";
    const kind = c.kind ?? "automated";
    const base = { id: c.id, severity, kind };

    // 1. Runnable command → execute via the CLI.
    if (c.command) {
      const rest = c.command.replace(/^coldpress\s+/, "");
      const resolved = resolvePlaceholders(rest, projectDir, today);
      if (resolved === null) {
        pending++;
        results.push({ ...base, status: "pending", detail: `command has unresolved placeholder(s): ${c.command}` });
        continue;
      }
      const code = run(resolved.split(/\s+/).filter(Boolean), projectDir);
      evaluated++;
      const ok = code === 0;
      if (!ok && severity === "block") blocked = true;
      const detail = ok ? `passed: coldpress ${resolved}` : `exit ${code}: coldpress ${resolved}`;
      results.push({ ...base, status: ok ? "pass" : "fail", detail });
      continue;
    }

    // 2. artefact-present -> the file (glob) must exist.
    if (kind === "artefact-present" && c.artefact_path) {
      const glob = c.artefact_path;
      const dir = resolve(projectDir, dirname(glob));
      const pat = escapeRe(basename(glob)).replace(/\\\*/g, ".*"); // escaped star becomes .*
      const found = existsSync(dir) && readdirSync(dir).some((f) => new RegExp("^" + pat + "$").test(f));
      evaluated++;
      if (!found && severity === "block") blocked = true;
      results.push({ ...base, status: found ? "pass" : "fail", detail: found ? `present: ${glob}` : `missing: ${glob}` });
      continue;
    }

    // 3. human / conditional / skill_ref-only -> needs a human or agent.
    pending++;
    results.push({ ...base, status: "pending", detail: `not auto-evaluable (${kind}) - needs a human/agent` });
  }

  return { phase, gate_id: gate.gate_id, results, blocked, pending, evaluated };
}
