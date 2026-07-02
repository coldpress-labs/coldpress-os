/**
 * Outcome-contract coverage (action plan §5 P4 acceptance): a P0/P1 requirement
 * without an outcome target fails the P4 gate. The `coldpress outcomes check`
 * command + the P4 gate call this.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { OutcomesSchema, type Outcomes } from "../../schemas/planning-artefacts/outcomes.schema.js";

export interface Requirement {
  id: string;
  priority: "P0" | "P1" | "P2" | "P3";
}

/** Requirement ids that MUST have an outcome (P0/P1) but don't. Pure — for tests. */
export function uncoveredRequirements(requirements: Requirement[], outcomes: Outcomes): string[] {
  const covered = new Set(outcomes.outcomes.map((o) => o.requirement_id));
  return requirements
    .filter((r) => (r.priority === "P0" || r.priority === "P1") && !covered.has(r.id))
    .map((r) => r.id);
}

export interface CoverageResult {
  ok: boolean;
  errors: string[];
}

/**
 * Read + validate `_context/planning/outcomes.yaml` and, when a requirements list
 * is provided, check P0/P1 coverage. Requirements come from the PRD; until WS4-E
 * PRD keying lands, the caller may pass them (or an empty list, which just
 * validates the outcomes file).
 */
export function checkOutcomes(cwd: string, requirements: Requirement[] = []): CoverageResult {
  const errors: string[] = [];
  const p = join(cwd, "_context/planning/outcomes.yaml");
  if (!existsSync(p)) {
    return { ok: false, errors: ["_context/planning/outcomes.yaml is missing — every P0/P1 requirement needs an outcome target."] };
  }
  const parsed = OutcomesSchema.safeParse(parseYamlSafe(readFileSync(p, "utf8")));
  if (!parsed.success) {
    for (const i of parsed.error.issues.slice(0, 10)) errors.push(`outcomes.yaml ${i.path.join(".")}: ${i.message}`);
    return { ok: false, errors };
  }
  const missing = uncoveredRequirements(requirements, parsed.data);
  for (const id of missing) errors.push(`requirement ${id} (P0/P1) has no outcome target in outcomes.yaml`);
  return { ok: errors.length === 0, errors };
}

function parseYamlSafe(s: string): unknown {
  try {
    return parseYaml(s);
  } catch {
    return undefined;
  }
}
