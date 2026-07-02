/**
 * `coldpress outcomes check` (§5 P4) — validate `_context/planning/outcomes.yaml`
 * and (when requirements are available) verify every P0/P1 requirement has an
 * outcome target. Wired into the P4 exit gate. Exit 1 on any gap.
 *
 * Requirements come from the PRD; the full P0-coverage cross-check activates when
 * WS4-E adds requirement-id keying to the PRD. Until then this validates the
 * outcomes contract's presence + shape (already a real P4 gate).
 */

import { checkOutcomes } from "../outcomes/coverage.js";

export interface RunOutcomesCheckOptions {
  projectDir?: string;
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
}

export function runOutcomesCheck(opts: RunOutcomesCheckOptions = {}): number {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));
  const cwd = opts.projectDir ?? process.cwd();

  const result = checkOutcomes(cwd);
  if (result.ok) {
    write("outcomes check OK — outcomes.yaml is present, valid, and covers every provided requirement.\n");
    return 0;
  }
  warn(`outcomes check FAILED (${result.errors.length}):\n`);
  for (const e of result.errors) warn(`  ✗ ${e}\n`);
  warn("Every P0/P1 requirement needs a measurable target + measurement source in _context/planning/outcomes.yaml.\n");
  return 1;
}
