/**
 * `coldpress evals` (§4.8, WS7-B) — run the framework golden tasks headlessly
 * and report per-task pass/fail. Scores the deterministic checks (gates, schema,
 * files, tests, grep, no-secret) against a workspace; exits 1 if any task fails.
 *
 * Usage:
 *   coldpress evals [--dir evals] [--workspace .] [--filter <substr>] [--json]
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { runEvals as runEvalsCore } from "../evals/run.js";

export interface RunEvalsOptions {
  projectDir?: string;
  /** Where the golden tasks live (default `<project>/evals`). */
  dir?: string;
  /** Workspace the checks score against (default the project dir). */
  workspace?: string;
  /** Only run tasks whose id includes this substring. */
  filter?: string;
  /** Emit the machine-readable report instead of the human summary. */
  json?: boolean;
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
}

export function runEvalsCommand(opts: RunEvalsOptions = {}): number {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));
  const cwd = opts.projectDir ?? process.cwd();
  const evalsDir = opts.dir ?? join(cwd, "evals");
  const workspace = opts.workspace ?? cwd;

  if (!existsSync(evalsDir)) {
    warn(`coldpress evals: no evals directory at ${evalsDir}. Add golden tasks under evals/ (see §4.8).\n`);
    return 0; // nothing to run is not a failure
  }

  let report;
  try {
    report = runEvalsCore({ evalsDir, workspace, filter: opts.filter });
  } catch (e) {
    warn(`coldpress evals: failed to load tasks — ${e instanceof Error ? e.message : String(e)}\n`);
    return 1;
  }

  if (opts.json) {
    write(`${JSON.stringify(report, null, 2)}\n`);
    return report.failed > 0 ? 1 : 0;
  }

  if (report.results.length === 0) {
    write("coldpress evals: 0 tasks matched.\n");
    return 0;
  }

  for (const r of report.results) {
    const mark = r.passed ? "✓" : "✗";
    write(`  ${mark} ${r.task_id}\n`);
    if (!r.passed) {
      for (const c of r.checks.filter((x) => !x.passed)) {
        write(`      ↳ failed ${c.kind}: ${c.target}\n`);
      }
      if (r.taxonomy_tags.length) write(`      ↳ tags: ${r.taxonomy_tags.join(", ")}\n`);
    }
  }
  write(
    `\n${report.passed}/${report.results.length} passed` +
      (report.failed ? `, ${report.failed} failed` : "") +
      (report.skippedChecks ? ` (${report.skippedChecks} rubric check(s) skipped headless)` : "") +
      ".\n",
  );
  return report.failed > 0 ? 1 : 0;
}
