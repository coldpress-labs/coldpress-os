/**
 * Shared helper: read + validate `.coldpress/state.yaml` for the hooks that
 * route off orchestration state (phase-gate, run-log). Returns the validated
 * State, or null when absent/unreadable/invalid — callers decide what a missing
 * state means for their gate (usually: no opinion).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { StateSchema, type State } from "../../schemas/state.schema.js";

export function readState(cwd: string): State | null {
  const p = join(cwd, ".coldpress", "state.yaml");
  if (!existsSync(p)) return null;
  try {
    const parsed = parseYaml(readFileSync(p, "utf8"));
    const r = StateSchema.safeParse(parsed);
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}
