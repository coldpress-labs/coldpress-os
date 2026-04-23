import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { intro, outro, spinner } from "@clack/prompts";
import pc from "picocolors";
import { enrichGraph } from "../graph/enrich.js";
import {
  DEFAULT_GRAPH_PATH,
  Graph,
  GraphNotFoundError,
  GraphSchemaError,
  loadGraph,
} from "../graph/index.js";
import { applySecureManifest } from "../graph/secure-manifest.js";
import { type Node, type Edge, GraphJsonSchema } from "../graph/types.js";
import { packageRoot } from "../utils/paths.js";

/**
 * Exit codes for `coldpress graph query` — skills use these to decide
 * between using graph results and falling back to direct file reads.
 *
 *   0 — query returned a result (may be empty set, still a successful
 *       query). Skills prefer graph data when this is the exit code.
 *   2 — no graph file found. Skills fall back to direct file reads.
 *   1 — schema-invalid graph or query error. Skills abort the current
 *       step and surface the error to the user; fallback not safe.
 */
export const GRAPH_QUERY_EXIT_OK = 0;
export const GRAPH_QUERY_EXIT_ERROR = 1;
export const GRAPH_QUERY_EXIT_NO_GRAPH = 2;

/**
 * `coldpress graph rebuild` — invoke Graphify to (re)generate the project
 * knowledge graph at `.coldpress/graph/graph.json`.
 *
 * Requires Python ≥ 3.10 + `pip install -e graph/vendor/graphify` so the
 * `graphify` module is importable. The Node CLI detects Python and
 * graphify availability up front and fails loud with remediation prose
 * if either is missing.
 */

export interface GraphRebuildOptions {
  /** project root; defaults to cwd */
  projectDir?: string;
  /** where to write graph.json; defaults to `.coldpress/graph/graph.json` */
  outputPath?: string;
  /** corpus to index; defaults to the project root */
  corpusPath?: string;
}

export async function runGraphRebuild(options: GraphRebuildOptions = {}): Promise<void> {
  intro(pc.bgCyan(pc.black(" coldpress graph rebuild ")));

  const projectDir = resolve(options.projectDir ?? process.cwd());
  const outRel = options.outputPath ?? DEFAULT_GRAPH_PATH;
  const outputPath = resolve(projectDir, outRel);
  const corpusPath = resolve(options.corpusPath ?? projectDir);

  // Probe Python + graphify availability up front.
  const probe = await probePython();
  if (!probe.ok) {
    outro(pc.red(`✗ ${probe.reason}`));
    process.exit(1);
  }

  await mkdir(dirname(outputPath), { recursive: true });

  const s = spinner();
  s.start(`Indexing ${pc.dim(corpusPath)}`);

  try {
    await runGraphifyBuild({ corpusPath, outputPath, pythonBin: probe.pythonBin });

    // Post-process: enrich Graphify's output with the coldpress namespace
    // (node_type / env_tag / dir_role) + merge CredentialName nodes from
    // secure/manifest.yaml. Both are pure Node-side passes — no more
    // Python invocations after this point.
    s.message("Enriching graph with coldpress metadata");
    await postProcessGraph({ outputPath, projectDir });

    s.stop(`${pc.green("✓")} Graph written to ${pc.dim(outputPath)}`);
    outro("Use `coldpress graph stats` to summarise the result.");
  } catch (err) {
    s.stop(pc.red(`✗ Rebuild failed: ${err instanceof Error ? err.message : String(err)}`));
    process.exit(1);
  }
}

interface PostProcessOptions {
  outputPath: string;
  projectDir: string;
}

async function postProcessGraph({ outputPath, projectDir }: PostProcessOptions): Promise<void> {
  const coldpressVersion = await resolveColdpressVersion();
  const projectSlug = await readProjectSlug(projectDir);

  const raw = await readFile(outputPath, "utf8");
  const parsed = GraphJsonSchema.parse(JSON.parse(raw));

  const withCredentials = await applySecureManifest(parsed, projectDir);
  const enriched = enrichGraph(withCredentials, { coldpressVersion, projectSlug });

  await writeFile(outputPath, `${JSON.stringify(enriched, null, 2)}\n`, "utf8");
}

async function resolveColdpressVersion(): Promise<string> {
  try {
    const raw = await readFile(join(packageRoot, "package.json"), "utf8");
    const pkg = JSON.parse(raw) as { version?: string };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

async function readProjectSlug(projectDir: string): Promise<string | undefined> {
  try {
    const yaml = await readFile(join(projectDir, "coldpress.yaml"), "utf8");
    const match = /^\s*slug:\s*"([^"]*)"/m.exec(yaml);
    return match?.[1];
  } catch {
    return undefined;
  }
}

export async function runGraphStats(options: GraphRebuildOptions = {}): Promise<void> {
  const projectDir = resolve(options.projectDir ?? process.cwd());

  let graph: Graph;
  try {
    graph = await loadGraph({ projectDir });
  } catch (err) {
    if (err instanceof GraphNotFoundError) {
      console.error(pc.red("✗ No graph found."));
      console.error(`  ${err.message}`);
      process.exit(1);
    }
    if (err instanceof GraphSchemaError) {
      console.error(pc.red(`✗ ${err.message}`));
      for (const issue of err.issues.slice(0, 10)) {
        console.error(`    [${issue.path}] ${issue.message}`);
      }
      if (err.issues.length > 10) {
        console.error(`    ... ${err.issues.length - 10} more`);
      }
      process.exit(1);
    }
    throw err;
  }

  const s = graph.stats();
  console.log();
  console.log(pc.bold(`Graph summary`));
  console.log(`  ${pc.dim("source:")}     ${graph.absPath}`);
  console.log(`  ${pc.dim("nodes:")}      ${pc.cyan(s.nodeCount)}`);
  console.log(`  ${pc.dim("edges:")}      ${pc.cyan(s.edgeCount)}`);
  console.log(`  ${pc.dim("communities:")} ${pc.cyan(s.communityCount)}`);
  console.log();
  console.log(pc.bold(`Nodes by type`));
  printHistogram(s.nodeTypeHistogram);
  console.log();
  console.log(pc.bold(`Nodes by env tag`));
  printHistogram(s.envTagHistogram);
  console.log();
  console.log(pc.bold(`Edges by relation`));
  printHistogram(s.relationHistogram);
}

// ─── Helpers ───────────────────────────────────────────────────────

interface PythonProbe {
  ok: boolean;
  pythonBin: string;
  reason: string;
}

async function probePython(): Promise<PythonProbe> {
  // Find Python 3.
  for (const bin of ["python3", "python"]) {
    const version = await captureStdout(bin, ["--version"]);
    if (!version.ok) continue;
    const match = /Python (\d+)\.(\d+)/.exec(version.stdout.trim());
    if (!match) continue;
    const major = parseInt(match[1] ?? "0", 10);
    const minor = parseInt(match[2] ?? "0", 10);
    if (major < 3 || (major === 3 && minor < 10)) {
      return {
        ok: false,
        pythonBin: bin,
        reason: `Found ${version.stdout.trim()} but Graphify requires Python ≥ 3.10. Install a newer Python and ensure it's on PATH.`,
      };
    }
    // Check graphify importable.
    const probe = await captureStdout(bin, [
      "-c",
      "import graphify; print('ok')",
    ]);
    if (!probe.ok || !probe.stdout.includes("ok")) {
      return {
        ok: false,
        pythonBin: bin,
        reason: `Python ${major}.${minor} found but \`graphify\` is not importable. From the coldpress-os install directory, run:\n    pip install -e graph/vendor/graphify\n  then retry \`coldpress graph rebuild\`.`,
      };
    }
    return { ok: true, pythonBin: bin, reason: "" };
  }

  return {
    ok: false,
    pythonBin: "python3",
    reason: "Python ≥ 3.10 not found on PATH. Graphify (the indexer) is Python-based.",
  };
}

interface CaptureResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

function captureStdout(bin: string, args: string[]): Promise<CaptureResult> {
  return new Promise((resolveCapture) => {
    const proc = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    proc.stdout.on("data", (chunk) => out.push(chunk));
    proc.stderr.on("data", (chunk) => err.push(chunk));
    proc.on("error", () => resolveCapture({ ok: false, stdout: "", stderr: "" }));
    proc.on("close", (code) =>
      resolveCapture({
        ok: code === 0,
        stdout: Buffer.concat(out).toString("utf8"),
        stderr: Buffer.concat(err).toString("utf8"),
      }),
    );
  });
}

interface GraphifyBuildOptions {
  corpusPath: string;
  outputPath: string;
  pythonBin: string;
}

async function runGraphifyBuild({ corpusPath, outputPath, pythonBin }: GraphifyBuildOptions): Promise<void> {
  return new Promise((resolveBuild, rejectBuild) => {
    // Graphify's `build` module expects a Python-side entry. The thin
    // wrapper here: spawn `python3 -m graphify.build --input <corpus>
    // --output <graph.json>`. Flag semantics match upstream's CLI.
    const proc = spawn(
      pythonBin,
      ["-m", "graphify.build", "--input", corpusPath, "--output", outputPath],
      { stdio: "inherit" },
    );
    proc.on("error", rejectBuild);
    proc.on("close", (code) => {
      if (code === 0) resolveBuild();
      else rejectBuild(new Error(`graphify.build exited with code ${code}`));
    });
  });
}

function printHistogram(histogram: Record<string, number>): void {
  const entries = Object.entries(histogram).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    console.log(pc.dim("  (empty)"));
    return;
  }
  const maxLabelLen = Math.max(...entries.map(([label]) => label.length));
  for (const [label, count] of entries) {
    console.log(
      `  ${label.padEnd(maxLabelLen + 2)} ${pc.cyan(count.toString().padStart(5))}`,
    );
  }
}

// ──────────────────────────────────────────────────────────────────
// `coldpress graph query` — structured queries against the graph,
// designed for skills to shell out to via `coldpress graph query ...`
// and consume the JSON output. Pretty-print mode is a human convenience.
// ──────────────────────────────────────────────────────────────────

export interface GraphQueryOptions {
  projectDir?: string;
  /** filter by coldpress.node_type (e.g. SacredDoc, CodeModule) */
  nodeType?: string;
  /** filter by coldpress.dir_role (e.g. _context/sacred, sandbox) */
  dirRole?: string;
  /** filter by coldpress.env_tag (sandbox / live / both / neither) */
  envTag?: string;
  /** filter edges by relation (e.g. implements, descends_from) */
  relation?: string;
  /** look up a specific node by id */
  id?: string;
  /** return neighbours of the given node id */
  neighborsOf?: string;
  /** limit number of results (default: no limit) */
  limit?: number;
  /** output format (default: json for scripts, pretty for terminals) */
  format?: "json" | "pretty";
}

export interface GraphQueryResult {
  kind: "nodes" | "edges" | "node" | "stats";
  query: Record<string, unknown>;
  data: Node | Edge[] | Node[] | null;
  count: number;
  graph_path: string;
}

export async function runGraphQuery(options: GraphQueryOptions = {}): Promise<void> {
  const projectDir = resolve(options.projectDir ?? process.cwd());
  const format = options.format ?? (process.stdout.isTTY ? "pretty" : "json");

  let graph: Graph;
  try {
    graph = await loadGraph({ projectDir });
  } catch (err) {
    if (err instanceof GraphNotFoundError) {
      // Signal fallback via exit code 2 — skills distinguish this from
      // a real error so they can degrade to direct file reads.
      if (format === "pretty") {
        console.error(pc.yellow(`⚠ No graph yet — run \`coldpress graph rebuild\` first.`));
      } else {
        console.error(
          JSON.stringify({
            error: "no_graph",
            message: err.message,
            remediation: "run `coldpress graph rebuild`",
          }),
        );
      }
      process.exit(GRAPH_QUERY_EXIT_NO_GRAPH);
    }
    if (err instanceof GraphSchemaError) {
      console.error(pc.red(`✗ ${err.message}`));
      for (const issue of err.issues.slice(0, 10)) {
        console.error(`    [${issue.path}] ${issue.message}`);
      }
      process.exit(GRAPH_QUERY_EXIT_ERROR);
    }
    throw err;
  }

  // Dispatch by query shape — order matters, most specific first.
  const result = dispatchQuery(graph, options);

  if (format === "json") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    renderPretty(result);
  }
}

function dispatchQuery(graph: Graph, options: GraphQueryOptions): GraphQueryResult {
  const query: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(options)) {
    if (k !== "projectDir" && k !== "format" && v !== undefined) {
      query[k] = v;
    }
  }

  // 1. Exact node by id.
  if (options.id) {
    const node = graph.node(options.id) ?? null;
    return {
      kind: "node",
      query,
      data: node,
      count: node ? 1 : 0,
      graph_path: graph.absPath,
    };
  }

  // 2. Neighbours of a node.
  if (options.neighborsOf) {
    const neighbours = graph.neighbors(options.neighborsOf, {
      relation: options.relation,
    });
    const limited = applyLimit(neighbours, options.limit);
    return {
      kind: "nodes",
      query,
      data: limited,
      count: neighbours.length,
      graph_path: graph.absPath,
    };
  }

  // 3. Edge filter by relation.
  if (options.relation) {
    const edges = graph.edgesByRelation(options.relation);
    const limited = applyLimit(edges, options.limit);
    return {
      kind: "edges",
      query,
      data: limited,
      count: edges.length,
      graph_path: graph.absPath,
    };
  }

  // 4. Node filters — compose across type/dirRole/envTag.
  if (options.nodeType || options.dirRole || options.envTag) {
    let candidates: Node[] = graph.json.nodes;
    if (options.nodeType) {
      candidates = candidates.filter((n) => n.coldpress?.node_type === options.nodeType);
    }
    if (options.dirRole) {
      candidates = candidates.filter((n) => n.coldpress?.dir_role === options.dirRole);
    }
    if (options.envTag) {
      candidates = candidates.filter((n) => n.coldpress?.env_tag === options.envTag);
    }
    const limited = applyLimit(candidates, options.limit);
    return {
      kind: "nodes",
      query,
      data: limited,
      count: candidates.length,
      graph_path: graph.absPath,
    };
  }

  // 5. No filter — return stats so an unqualified `graph query` is useful.
  return {
    kind: "stats",
    query,
    data: null,
    count: graph.json.nodes.length,
    graph_path: graph.absPath,
  };
}

function applyLimit<T>(items: T[], limit?: number): T[] {
  if (typeof limit === "number" && limit >= 0) return items.slice(0, limit);
  return items;
}

function renderPretty(result: GraphQueryResult): void {
  console.log();
  console.log(pc.bold(`Graph query`));
  console.log(`  ${pc.dim("source:")} ${result.graph_path}`);
  console.log(`  ${pc.dim("kind:")}   ${result.kind}`);
  console.log(`  ${pc.dim("count:")}  ${pc.cyan(result.count)}`);
  console.log();

  if (result.kind === "stats") {
    console.log(pc.dim("  (no filter applied — pass --node-type / --dir-role / --env-tag / --relation / --id / --neighbors)"));
    return;
  }

  if (result.kind === "node") {
    if (!result.data) {
      console.log(pc.yellow("  (node not found)"));
      return;
    }
    console.log(JSON.stringify(result.data, null, 2));
    return;
  }

  if (result.kind === "nodes" || result.kind === "edges") {
    const arr = result.data as (Node | Edge)[];
    if (arr.length === 0) {
      console.log(pc.dim("  (no matches)"));
      return;
    }
    // Compact one-line-per-item render; full JSON available via --format json.
    for (const item of arr) {
      if (result.kind === "nodes") {
        const n = item as Node;
        const tag = n.coldpress?.node_type
          ? pc.cyan(n.coldpress.node_type.padEnd(14))
          : pc.dim("<unclassified>".padEnd(14));
        const envTag = n.coldpress?.env_tag
          ? pc.dim(` [${n.coldpress.env_tag}]`)
          : "";
        console.log(`  ${tag} ${n.id.padEnd(40)} ${n.label ?? ""}${envTag}`);
      } else {
        const e = item as Edge;
        const rel = pc.cyan(String(e.relation ?? "<no-relation>").padEnd(24));
        console.log(`  ${rel} ${e.source} → ${e.target}`);
      }
    }
  }
}

// Barrel passthroughs used by cli.ts.
export { loadGraph } from "../graph/index.js";

// ─── `coldpress graph view` — visualizer CLI (§6.1) ───────────────────

import { renderDot } from "../graph/render/dot.js";
import { renderHtml } from "../graph/render/html.js";
import { renderMermaid } from "../graph/render/mermaid.js";
import {
  getSubgraphBuilder,
  listSubgraphNames,
  type Subgraph,
} from "../graph/subgraphs/index.js";

export const GRAPH_VIEW_EXIT_OK = 0;
export const GRAPH_VIEW_EXIT_ERROR = 1;
export const GRAPH_VIEW_EXIT_NO_GRAPH = 2;

export type GraphViewFormat = "mermaid" | "dot" | "html";

export interface GraphViewOptions {
  /** Kebab-case subgraph id — one of the registered canonical views. */
  subgraph: string;
  projectDir?: string;
  /** Output format. Defaults to `mermaid`. */
  format?: GraphViewFormat;
  /** Optional file path; defaults to stdout. */
  output?: string;
  /** Node cap passed to the renderer. */
  maxNodes?: number;
  /** HTML-only: override Cytoscape CDN URL. */
  cytoscapeSrc?: string;
}

export async function runGraphView(options: GraphViewOptions): Promise<number> {
  const name = options.subgraph;
  const builder = getSubgraphBuilder(name);
  if (!builder) {
    console.error(pc.red(`unknown subgraph: "${name}"`));
    console.error(pc.dim(`  available: ${listSubgraphNames().join(", ")}`));
    return GRAPH_VIEW_EXIT_ERROR;
  }

  const projectDir = resolve(options.projectDir ?? process.cwd());
  let graph: Graph;
  try {
    graph = await loadGraph({ projectDir });
  } catch (err) {
    if (err instanceof GraphNotFoundError) {
      console.error(pc.red("✗ No graph found."));
      console.error(pc.dim(`  ${err.message}`));
      return GRAPH_VIEW_EXIT_NO_GRAPH;
    }
    if (err instanceof GraphSchemaError) {
      console.error(pc.red(`✗ ${err.message}`));
      for (const issue of err.issues.slice(0, 10)) {
        console.error(pc.dim(`    [${issue.path}] ${issue.message}`));
      }
      return GRAPH_VIEW_EXIT_ERROR;
    }
    throw err;
  }

  const subgraph = builder(graph);
  const format = options.format ?? "mermaid";
  const output = renderSubgraph(subgraph, format, {
    maxNodes: options.maxNodes,
    cytoscapeSrc: options.cytoscapeSrc,
  });

  if (options.output) {
    const target = resolve(projectDir, options.output);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, output, "utf8");
    console.error(
      pc.dim(
        `wrote ${target} — ${subgraph.nodes.length} nodes, ${subgraph.edges.length} edges`,
      ),
    );
  } else {
    process.stdout.write(output);
  }

  return GRAPH_VIEW_EXIT_OK;
}

interface RenderPassOptions {
  maxNodes?: number;
  cytoscapeSrc?: string;
}

function renderSubgraph(
  subgraph: Subgraph,
  format: GraphViewFormat,
  options: RenderPassOptions,
): string {
  if (format === "mermaid") return renderMermaid(subgraph, { maxNodes: options.maxNodes });
  if (format === "dot") return renderDot(subgraph, { maxNodes: options.maxNodes });
  if (format === "html")
    return renderHtml(subgraph, {
      maxNodes: options.maxNodes,
      cytoscapeSrc: options.cytoscapeSrc,
    });
  throw new Error(`unknown format: ${format}`);
}
