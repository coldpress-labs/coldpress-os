/**
 * `supersede` — record a supersession decision when Phase 2 skill conclusions
 * conflict with pre-loaded `_input/` material.
 *
 * Three mechanics:
 *  1. Idempotency guard — if a `superseded_by` edge already exists in
 *     graph.json for the same source/target pair, this is a no-op.
 *  2. Graph edge write — appends a MANUAL `superseded_by` edge to
 *     `.coldpress/graph/graph.json` so Graphify's next rebuild preserves it.
 *  3. Audit log — appends a row to `_context/audit/supersessions-{date}.md`
 *     for governance traceability.
 *
 * Butler owns user interaction (presenting the conflict, capturing the
 * decision). This helper is called AFTER the decision is made; `confirmed`
 * carries the user's answer.
 */

import { access, appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { GraphJson } from "../graph/types.js";

const DEFAULT_GRAPH_PATH = join(".coldpress", "graph", "graph.json");
const DEFAULT_AUDIT_DIR = join("_context", "audit");

export interface SupersedeOptions {
  projectRoot: string;
  /** Relative path to the `_input/` file whose content is being superseded (e.g., `_input/reference/old-brief.md`). */
  inputPath: string;
  /** Relative path to the sacred doc that supersedes it (e.g., `_context/sacred/context.md`). */
  sacredDocPath: string;
  /** Summary of what the `_input/` file states. */
  conflictingContent: string;
  /** Summary of what the sacred doc (or new discovery) states. */
  newContent: string;
  /** Contextual note from the skill step explaining why the conflict surfaced. */
  decisionContext: string;
  /** True when the user has confirmed the supersession. False → no-op (returns current state). */
  confirmed: boolean;
  /** Optional free-text rationale captured from the user. */
  rationale?: string;
  /** Override the graph-file path relative to projectRoot. */
  graphPath?: string;
  /** Override the audit directory relative to projectRoot. */
  auditDir?: string;
}

export interface SupersedeResult {
  confirmed: boolean;
  rationale?: string;
  /** True when a new graph edge was written this call. */
  edge_written: boolean;
  /** Unique audit-log row id, present when edge_written is true. */
  log_entry_id?: string;
  /** True when the edge already existed; this call was a no-op. */
  already_existed: boolean;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Parse graph.json; returns null on any read/parse failure. */
async function readGraph(graphAbs: string): Promise<GraphJson | null> {
  if (!(await pathExists(graphAbs))) return null;
  try {
    const raw = await readFile(graphAbs, "utf8");
    return JSON.parse(raw) as GraphJson;
  } catch {
    return null;
  }
}

/** Check for an existing `superseded_by` edge between source and target. */
function supersessionEdgeExists(
  graph: GraphJson,
  source: string,
  target: string,
): boolean {
  return graph.links.some(
    (e) =>
      e.source === source &&
      e.target === target &&
      e.relation === "superseded_by",
  );
}

/** Build a stable log-entry id: date + last segment of inputPath. */
function buildLogEntryId(inputPath: string, nowIso: string): string {
  const datePart = nowIso.slice(0, 10).replace(/-/g, "");
  const slug = inputPath
    .replace(/[^a-zA-Z0-9/._-]/g, "")
    .replace(/\//g, "-")
    .slice(-32);
  return `sup-${datePart}-${slug}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function appendAuditRow(opts: {
  auditDir: string;
  logEntryId: string;
  inputPath: string;
  sacredDocPath: string;
  rationale: string;
  decisionContext: string;
  nowIso: string;
}): Promise<void> {
  await mkdir(opts.auditDir, { recursive: true });
  const date = opts.nowIso.slice(0, 10);
  const logFile = join(opts.auditDir, `supersessions-${date}.md`);

  const fileExists = await pathExists(logFile);
  if (!fileExists) {
    const header = [
      `# Supersessions Log — ${date}`,
      "",
      "| Entry ID | Date | Sacred Doc | Superseded _input/ | Rationale | Context |",
      "|---|---|---|---|---|---|",
      "",
    ].join("\n");
    await writeFile(logFile, header, "utf8");
  }

  const row =
    `| ${opts.logEntryId} | ${date} | ${opts.sacredDocPath} | ${opts.inputPath} | ${opts.rationale.replace(/\|/g, "\\|")} | ${opts.decisionContext.replace(/\|/g, "\\|")} |\n`;
  await appendFile(logFile, row, "utf8");
}

/**
 * Record a supersession decision — or check its current state.
 *
 * If `confirmed` is `false`, no writes occur; the function returns
 * `{ confirmed: false, edge_written: false, already_existed }` so callers
 * can determine whether the edge exists without side effects.
 *
 * If `confirmed` is `true` and the edge does not yet exist, it is appended
 * to graph.json and an audit-log row is written.
 *
 * Idempotent: if the edge already exists, `already_existed: true` is returned
 * regardless of the `confirmed` flag.
 */
export async function promptSupersede(opts: SupersedeOptions): Promise<SupersedeResult> {
  const graphAbs = join(opts.projectRoot, opts.graphPath ?? DEFAULT_GRAPH_PATH);
  const auditDir = join(opts.projectRoot, opts.auditDir ?? DEFAULT_AUDIT_DIR);

  const graph = await readGraph(graphAbs);

  if (graph !== null && supersessionEdgeExists(graph, opts.inputPath, opts.sacredDocPath)) {
    return { confirmed: opts.confirmed, edge_written: false, already_existed: true };
  }

  if (!opts.confirmed) {
    return { confirmed: false, edge_written: false, already_existed: false };
  }

  const nowIso = new Date().toISOString();
  const logEntryId = buildLogEntryId(opts.inputPath, nowIso);
  const rationale = opts.rationale ?? opts.decisionContext;

  // Write graph edge — create a minimal graph.json if none exists.
  const newEdge = {
    source: opts.inputPath,
    target: opts.sacredDocPath,
    relation: "superseded_by" as const,
    confidence: "MANUAL" as const,
  };

  if (graph === null) {
    const newGraph: GraphJson = {
      directed: true,
      multigraph: false,
      graph: { schema_version: 1, generated_at: nowIso },
      nodes: [],
      links: [newEdge],
    };
    await mkdir(dirname(graphAbs), { recursive: true });
    await writeFile(graphAbs, JSON.stringify(newGraph, null, 2), "utf8");
  } else {
    graph.links.push(newEdge);
    await writeFile(graphAbs, JSON.stringify(graph, null, 2), "utf8");
  }

  await appendAuditRow({
    auditDir,
    logEntryId,
    inputPath: opts.inputPath,
    sacredDocPath: opts.sacredDocPath,
    rationale,
    decisionContext: opts.decisionContext,
    nowIso,
  });

  return {
    confirmed: true,
    rationale,
    edge_written: true,
    log_entry_id: logEntryId,
    already_existed: false,
  };
}
