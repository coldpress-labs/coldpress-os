/**
 * `graph-staleness` — compare the graph.json build time against the latest
 * mtime under `_input/`. First consumer: Phase 2 `pre-project-interview`
 * Step 1. Same helper is available to Phases 3-9 at their respective
 * phase-entry points (per Phase II forward-carry).
 *
 * Uses filesystem mtime (the graph file's mtime) as the authoritative
 * "graph build time" rather than parsing an internal `build_time` field.
 * Simpler v1; robust to graph-schema changes.
 *
 * Hidden files (dotfiles) are skipped — no user pre-loads `.DS_Store`
 * as indexable material.
 */

import { access, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const DEFAULT_GRAPH_PATH = join(".coldpress", "graph", "graph.json");
const DEFAULT_INPUT_PATH = "_input";
const MAX_NEWER_FILES_REPORTED = 10;

export type StalenessReason = "fresh" | "stale" | "no-graph" | "no-input";

export interface StalenessCheckOptions {
  /** Project root — the directory containing `.coldpress/` and `_input/`. */
  projectRoot: string;
  /** Override the graph-file path relative to projectRoot. */
  graphPath?: string;
  /** Override the input directory relative to projectRoot. */
  inputPath?: string;
}

export interface StalenessResult {
  /** True when `_input/` has files newer than the graph build, OR the graph is missing. */
  stale: boolean;
  reason: StalenessReason;
  graphBuildTime: Date | null;
  latestInputMtime: Date | null;
  /** Up to 10 relative paths under `_input/` newer than the graph, sorted newest-first. */
  newerInputFiles: string[];
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(root: string): Promise<string[]> {
  const results: string[] = [];
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      const sub = await walkFiles(fullPath);
      results.push(...sub);
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Check whether the knowledge graph is stale relative to `_input/` content.
 *
 * Returns `stale: true` when any `_input/` file has an mtime newer than the
 * graph file's mtime, or when the graph is missing entirely.
 *
 * `reason`:
 *  - `fresh`     — graph mtime ≥ every input file mtime
 *  - `stale`     — one or more input files newer than graph
 *  - `no-graph`  — graph file missing; rebuild required before any query
 *  - `no-input`  — `_input/` missing or empty; graph may still be valid for `_context/` content
 */
export async function checkGraphStaleness(
  opts: StalenessCheckOptions,
): Promise<StalenessResult> {
  const graphPath = join(opts.projectRoot, opts.graphPath ?? DEFAULT_GRAPH_PATH);
  const inputPath = join(opts.projectRoot, opts.inputPath ?? DEFAULT_INPUT_PATH);

  const graphExists = await pathExists(graphPath);
  let graphBuildTime: Date | null = null;
  if (graphExists) {
    const graphStat = await stat(graphPath);
    graphBuildTime = graphStat.mtime;
  }

  const inputExists = await pathExists(inputPath);
  if (!inputExists) {
    return {
      stale: !graphExists,
      reason: graphExists ? "no-input" : "no-graph",
      graphBuildTime,
      latestInputMtime: null,
      newerInputFiles: [],
    };
  }

  const files = await walkFiles(inputPath);
  if (files.length === 0) {
    return {
      stale: !graphExists,
      reason: graphExists ? "no-input" : "no-graph",
      graphBuildTime,
      latestInputMtime: null,
      newerInputFiles: [],
    };
  }

  let latestInputMtime: Date | null = null;
  const newerFiles: { path: string; mtime: Date }[] = [];

  for (const file of files) {
    const s = await stat(file);
    const m = s.mtime;
    if (latestInputMtime === null || m > latestInputMtime) {
      latestInputMtime = m;
    }
    if (graphBuildTime && m > graphBuildTime) {
      newerFiles.push({ path: file, mtime: m });
    }
  }

  if (!graphExists) {
    return {
      stale: true,
      reason: "no-graph",
      graphBuildTime: null,
      latestInputMtime,
      newerInputFiles: [],
    };
  }

  const stale = newerFiles.length > 0;
  newerFiles.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  const newerInputFiles = newerFiles
    .slice(0, MAX_NEWER_FILES_REPORTED)
    .map((f) => relative(opts.projectRoot, f.path));

  return {
    stale,
    reason: stale ? "stale" : "fresh",
    graphBuildTime,
    latestInputMtime,
    newerInputFiles,
  };
}
