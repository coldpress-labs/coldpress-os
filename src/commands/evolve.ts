/**
 * `coldpress evolve` (§4.8, WS7-D) — cross-project aggregation of the EventStream
 * run-logs into the evolution report: failure + cost leaderboards, estimation
 * bias, and top-3 patch proposals. Acceptance: produces a report across ≥2
 * project run-logs.
 *
 * Usage:
 *   coldpress evolve [--project <dir> ...] [--json]
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { aggregateEvolve, type EvolveReport, type TaxonomyLookup } from "../evolve/aggregate.js";
import { listRuns, readRun } from "../event-stream/reader.js";
import { packageRoot } from "../utils/paths.js";
import type { Event } from "../../schemas/event-stream.schema.js";

export interface RunEvolveOptions {
  /** Project roots to aggregate (default: [cwd]). ≥2 for cross-project. */
  projects?: string[];
  json?: boolean;
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
}

function loadTaxonomy(): TaxonomyLookup {
  const map: TaxonomyLookup = new Map();
  try {
    const t = parseYaml(readFileSync(join(packageRoot, "data/failure-taxonomy.yaml"), "utf8")) as {
      classes?: { id: string; category: string; description: string }[];
    };
    for (const c of t.classes ?? []) map.set(c.id, { category: c.category, description: c.description });
  } catch {
    /* taxonomy is optional — proposals just omit the category */
  }
  return map;
}

export async function runEvolve(opts: RunEvolveOptions = {}): Promise<number> {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));
  const projectDirs = opts.projects && opts.projects.length ? opts.projects : [process.cwd()];

  const events: Event[] = [];
  let runCount = 0;
  for (const dir of projectDirs) {
    const runs = await listRuns({ projectDir: dir });
    for (const runId of runs) {
      try {
        events.push(...(await readRun(runId, { projectDir: dir })));
        runCount++;
      } catch (e) {
        warn(`coldpress evolve: skipping unreadable run ${runId} in ${dir} — ${e instanceof Error ? e.message : e}\n`);
      }
    }
  }

  if (runCount === 0) {
    warn("coldpress evolve: no run-logs found (looked in .coldpress/runs/ of each project). Nothing to aggregate.\n");
    return 0;
  }

  const report = aggregateEvolve({
    events,
    projects: projectDirs.length,
    runs: runCount,
    taxonomy: loadTaxonomy(),
  });

  if (opts.json) {
    write(`${JSON.stringify(report, null, 2)}\n`);
    return 0;
  }

  printHuman(report, write);
  return 0;
}

function printHuman(r: EvolveReport, write: (s: string) => void): void {
  write(`\ncoldpress evolve — ${r.runs} run(s) across ${r.projects} project(s), ${r.events} events\n`);

  write(`\nFailure leaderboard:\n`);
  if (r.failure_leaderboard.length === 0) write(`  (no tagged failures — clean run-logs)\n`);
  for (const f of r.failure_leaderboard) write(`  ${String(f.count).padStart(4)}  ${f.tag}\n`);

  write(`\nCost (tokens, where exposed): ${r.cost.total_tokens.toLocaleString()}\n`);
  for (const [m, t] of Object.entries(r.cost.by_model)) write(`  by model  ${m}: ${t.toLocaleString()}\n`);
  for (const [a, t] of Object.entries(r.cost.by_agent)) write(`  by agent  ${a}: ${t.toLocaleString()}\n`);

  write(`\nEstimation bias: estimate-blown ×${r.estimation_bias.estimate_blown}\n  ${r.estimation_bias.note}\n`);

  write(`\nOverride leaderboard (enforcement gates bypassed via COLDPRESS_OVERRIDE):\n`);
  if (r.override_leaderboard.length === 0) {
    write(`  (no overrides — gates held)\n`);
  } else {
    for (const o of r.override_leaderboard) {
      write(`  ${String(o.count).padStart(4)}  ${o.gate}\n`);
      // Show up to 2 distinct reasons — a frequently-overridden gate is a mis-designed gate.
      for (const reason of [...new Set(o.reasons)].slice(0, 2)) write(`        · ${reason}\n`);
    }
  }

  write(`\nTop-3 patch proposals:\n`);
  if (r.top_patches.length === 0) write(`  (nothing to patch — no recurring failures)\n`);
  for (const p of r.top_patches) write(`  ${p.rank}. [${p.count}×] ${p.proposal}\n`);
  write("\n");
}
