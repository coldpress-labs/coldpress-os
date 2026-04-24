/**
 * Stats tab — skill-invocation counts, sacred-doc inventory, graph
 * size, run telemetry. Reads EventStream + graph + filesystem.
 */

import { stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { listRuns, readRun } from "../../event-stream/reader.js";
import type { Event } from "../../../schemas/event-stream.schema.js";
import type { StatsData } from "../types.js";

const SACRED_DOCS = [
  "context.md",
  "tech-stack.md",
  "prd.md",
  "architecture.md",
  "pert-chart.md",
];

export async function assembleStats(projectDir: string): Promise<StatsData> {
  const events = await collectAllEvents(projectDir);
  const skillStats = aggregateSkillStats(events);
  const sacred = await assembleSacredDocs(projectDir);
  const graph = await assembleGraphCounts(projectDir);
  const runs = await collectRuns(projectDir);

  return {
    skill_invocations: skillStats,
    graph,
    sacred_docs: sacred,
    runs,
  };
}

async function collectAllEvents(projectDir: string): Promise<Event[]> {
  const runs = await listRuns({ projectDir });
  const events: Event[] = [];
  for (const runId of runs) {
    try {
      const r = await readRun(runId, { projectDir });
      events.push(...r);
    } catch {
      /* skip malformed run */
    }
  }
  return events;
}

function aggregateSkillStats(events: Event[]): StatsData["skill_invocations"] {
  let total = 0;
  let success = 0;
  let fail = 0;
  const bySkill: Record<string, number> = {};
  for (const e of events) {
    if (e.kind === "skill-invoke") {
      total++;
      bySkill[e.skill_id] = (bySkill[e.skill_id] ?? 0) + 1;
    }
    if (e.kind === "skill-result") {
      if (e.exit_code === 0) success++;
      else fail++;
    }
  }
  return { total, success, fail, by_skill: bySkill };
}

async function assembleSacredDocs(
  projectDir: string,
): Promise<StatsData["sacred_docs"]> {
  const root = join(projectDir, "_context/sacred");
  const missing: string[] = [];
  let present = 0;
  for (const doc of SACRED_DOCS) {
    try {
      const s = await stat(join(root, doc));
      if (s.isFile()) present++;
      else missing.push(doc);
    } catch {
      missing.push(doc);
    }
  }
  return { expected: SACRED_DOCS.length, present, missing };
}

async function assembleGraphCounts(
  projectDir: string,
): Promise<StatsData["graph"]> {
  const path = resolve(projectDir, ".coldpress/graph/graph.json");
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(path, "utf8");
    const json = JSON.parse(raw) as {
      nodes?: unknown[];
      links?: unknown[];
    };
    return {
      node_count: Array.isArray(json.nodes) ? json.nodes.length : 0,
      edge_count: Array.isArray(json.links) ? json.links.length : 0,
    };
  } catch {
    return null;
  }
}

async function collectRuns(projectDir: string): Promise<StatsData["runs"]> {
  const runs = await listRuns({ projectDir });
  return {
    total: runs.length,
    latest: runs.length > 0 ? runs[runs.length - 1]! : null,
  };
}
