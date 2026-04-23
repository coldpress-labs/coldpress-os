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
import { GraphJsonSchema } from "../graph/types.js";
import { packageRoot } from "../utils/paths.js";

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

// Barrel passthroughs used by cli.ts.
export { loadGraph } from "../graph/index.js";
