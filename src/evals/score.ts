/**
 * Deterministic eval scoring (WS7-B, §4.8). Pure-ish check evaluators over a
 * workspace directory — no model, no network. "Deterministic scoring first":
 * gates pass, schema valid, files exist, tests green. A `rubric` check has no
 * deterministic answer, so headless runs skip it (reported, never a silent pass).
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { isGateGreen } from "../hooks/phase-gate.js";
import type { EvalCheck } from "../../schemas/eval-task.schema.js";
import type { State } from "../../schemas/state.schema.js";

export interface CheckOutcome {
  kind: EvalCheck["kind"];
  target: string;
  /** null = skipped (e.g. rubric in a headless run) — neither pass nor fail. */
  passed: boolean | null;
  detail?: string;
}

/** Split a `"path::rest"` target into [path, rest]. */
function splitTarget(target: string): [string, string | undefined] {
  const i = target.indexOf("::");
  return i === -1 ? [target, undefined] : [target.slice(0, i), target.slice(i + 2)];
}

/** Shallow glob: supports a trailing `*` and `**` as "any descendant". Exact otherwise. */
function pathMatches(workspace: string, pattern: string): boolean {
  if (!pattern.includes("*")) return existsSync(join(workspace, pattern));
  const globStar = pattern.includes("**");
  const prefix = pattern.split("*")[0]!.replace(/\/$/, "");
  const suffix = pattern.slice(pattern.lastIndexOf("*") + 1);
  const base = join(workspace, prefix);
  const walk = (dir: string, depth: number): boolean => {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return false;
    }
    for (const e of entries) {
      const p = join(dir, e);
      if ((suffix === "" || e.endsWith(suffix)) && statSync(p).isFile()) return true;
      if ((globStar || depth < 1) && statSync(p).isDirectory() && walk(p, depth + 1)) return true;
    }
    return false;
  };
  return walk(existsSync(base) ? base : workspace, 0);
}

function readState(workspace: string): State | null {
  try {
    return parseYaml(readFileSync(join(workspace, ".coldpress", "state.yaml"), "utf8")) as State;
  } catch {
    return null;
  }
}

const SECRET_RE = /(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|ghp_[A-Za-z0-9]{36})/;

/** Score one check against the workspace. Never throws — a thrown check fails. */
export function scoreCheck(check: EvalCheck, workspace: string): CheckOutcome {
  const { kind, target } = check;
  const out = (passed: boolean | null, detail?: string): CheckOutcome => ({ kind, target, passed, detail });
  try {
    switch (kind) {
      case "file-exists":
        return out(pathMatches(workspace, target));
      case "file-absent":
        return out(!pathMatches(workspace, target));
      case "gate-green": {
        const state = readState(workspace);
        if (!state) return out(false, "no .coldpress/state.yaml");
        return out(isGateGreen(state.gates?.[target]));
      }
      case "tests-green":
        try {
          execSync(target, { cwd: workspace, stdio: "pipe", timeout: 120_000 });
          return out(true);
        } catch (e) {
          return out(false, e instanceof Error ? e.message.split("\n")[0] : "non-zero exit");
        }
      case "grep":
      case "grep-absent": {
        const [path, re] = splitTarget(target);
        if (re === undefined) return out(false, "grep target needs '<path>::<regex>'");
        let hit = false;
        try {
          hit = new RegExp(re).test(readFileSync(join(workspace, path), "utf8"));
        } catch {
          hit = false;
        }
        return out(kind === "grep" ? hit : !hit);
      }
      case "no-secret": {
        const base = join(workspace, target);
        const scan = (dir: string): boolean => {
          for (const e of safeReaddir(dir)) {
            const p = join(dir, e);
            if (e === "node_modules" || e === ".git") continue;
            if (statSync(p).isDirectory()) {
              if (scan(p)) return true;
            } else if (SECRET_RE.test(safeRead(p))) return true;
          }
          return false;
        };
        return out(!scan(existsSync(base) ? base : workspace));
      }
      case "schema-valid": {
        // Deterministic well-formedness: the artifact parses as YAML/JSON.
        // (Full schema-name → validator wiring is a follow-up; a malformed
        // artifact still fails here, which catches the common regression.)
        const [path] = splitTarget(target);
        try {
          parseYaml(readFileSync(join(workspace, path), "utf8"));
          return out(true, "parses (structural check; full schema validation TODO)");
        } catch {
          return out(false, "does not parse");
        }
      }
      case "rubric":
        return out(null, "rubric check skipped in headless deterministic run");
      default:
        return out(false, `unknown check kind: ${kind}`);
    }
  } catch (e) {
    return out(false, e instanceof Error ? e.message : String(e));
  }
}

function safeReaddir(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}
function safeRead(p: string): string {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}
