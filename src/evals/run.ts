/**
 * Eval runner orchestration (WS7-B, §4.8). Discovers golden tasks under an
 * `evals/` tree, scores each task's deterministic checks against a workspace,
 * and produces per-task pass/fail results. Headless — no model required for the
 * deterministic checks (that is the acceptance: `coldpress evals` runs headlessly
 * with per-task pass/fail). Agent-SDK task execution (the full loop) is layered
 * on top via `runTask` later; the scorer is the load-bearing core.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { scoreCheck } from "./score.js";
import { EvalTaskSchema, type EvalResult, type EvalTask } from "../../schemas/eval-task.schema.js";

export interface DiscoveredTask {
  task: EvalTask;
  /** Path the task was loaded from (for diagnostics). */
  source: string;
}

/** Walk an evals dir for `*.yaml`/`*.yml` task files; validate each. Invalid tasks throw. */
export function discoverTasks(evalsDir: string, filter?: string): DiscoveredTask[] {
  const found: DiscoveredTask[] = [];
  // `--filter` accepts a COMMA-SEPARATED list so a profile's `eval_subset`
  // (an array) maps cleanly (WS10-E4): a task matches if its id contains ANY
  // of the substrings. A single substring still works (a one-element list).
  const needles = (filter ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const matches = (id: string): boolean => needles.length === 0 || needles.some((n) => id.includes(n));
  const walk = (dir: string): void => {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const e of entries.sort()) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) {
        walk(p);
      } else if (/\.ya?ml$/.test(e)) {
        const task = EvalTaskSchema.parse(parseYaml(readFileSync(p, "utf8")));
        if (matches(task.id)) found.push({ task, source: p });
      }
    }
  };
  walk(evalsDir);
  return found;
}

export interface EvalRunReport {
  results: EvalResult[];
  passed: number;
  failed: number;
  /** Checks skipped (e.g. rubric) — reported, not counted as pass/fail. */
  skippedChecks: number;
}

/** Score one already-set-up task's checks against a workspace. */
export function scoreTask(task: EvalTask, workspace: string): EvalResult {
  const outcomes = task.checks.map((c) => scoreCheck(c, workspace));
  const decided = outcomes.filter((o) => o.passed !== null);
  const passed = decided.length > 0 && decided.every((o) => o.passed === true);
  return {
    task_id: task.id,
    passed,
    checks: outcomes.map((o) => ({ kind: o.kind, target: o.target, passed: o.passed === true })),
    // On failure, attribute the classes the task guards against (the loop's tag).
    taxonomy_tags: passed ? [] : task.guards_against,
  };
}

/** Run every discovered task's deterministic checks against `workspace`. */
export function runEvals(opts: { evalsDir: string; workspace: string; filter?: string }): EvalRunReport {
  const tasks = discoverTasks(opts.evalsDir, opts.filter);
  const results: EvalResult[] = [];
  let skippedChecks = 0;
  for (const { task } of tasks) {
    const outcomes = task.checks.map((c) => scoreCheck(c, opts.workspace));
    skippedChecks += outcomes.filter((o) => o.passed === null).length;
    results.push(scoreTask(task, opts.workspace));
  }
  return {
    results,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    skippedChecks,
  };
}
