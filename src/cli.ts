import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { runDashboard } from "./commands/dashboard.js";
import { runFeedback } from "./commands/feedback.js";
import {
  runGraphQuery,
  runGraphRebuild,
  runGraphStats,
  runGraphView,
} from "./commands/graph.js";
import { runImportBmad } from "./commands/import.js";
import { runInit } from "./commands/init.js";
import { runRunInspect, runRunList } from "./commands/run.js";
import { runSecurityAggregate } from "./commands/security.js";
import { runUpdate } from "./commands/update.js";
import { packageRoot } from "./utils/paths.js";

const pkg = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
) as { version: string };

const program = new Command();

program
  .name("coldpress")
  .description("AI-native development framework — 9-phase lifecycle, 9 subagents, atomic skills.")
  .version(pkg.version, "-v, --version", "output the current version");

program
  .command("init")
  .description("Scaffold a new coldpress-os project in a new directory")
  .argument("[project-name]", "name of the project to create (otherwise prompted)")
  .action(async (projectNameArg?: string) => {
    try {
      await runInit({ projectNameArg });
    } catch (err) {
      console.error(pc.red(`init failed: ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

const graphCmd = program
  .command("graph")
  .description("Manage the project knowledge graph (powered by vendored Graphify)");

graphCmd
  .command("rebuild")
  .description("Invoke Graphify to (re)generate .coldpress/graph/graph.json")
  .action(async () => {
    try {
      await runGraphRebuild();
    } catch (err) {
      console.error(pc.red(`graph rebuild failed: ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

graphCmd
  .command("stats")
  .description("Summarise the current graph (nodes, edges, communities, types, relations)")
  .action(async () => {
    try {
      await runGraphStats();
    } catch (err) {
      console.error(pc.red(`graph stats failed: ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

graphCmd
  .command("query")
  .description("Query the graph — filter by node_type, dir_role, env_tag, relation, id, or neighbours")
  .option("--node-type <type>", "filter by coldpress.node_type (SacredDoc, CodeModule, ...)")
  .option("--dir-role <role>", "filter by coldpress.dir_role (_context/sacred, sandbox, ...)")
  .option("--env-tag <tag>", "filter by coldpress.env_tag (sandbox | live | both | neither)")
  .option("--relation <relation>", "filter edges by relation (implements, descends_from, ...)")
  .option("--id <id>", "look up a specific node by id")
  .option("--neighbors <id>", "list neighbours of the given node id")
  .option("--limit <n>", "limit number of results", (v) => parseInt(v, 10))
  .option("--format <format>", "output format: json | pretty (default: pretty if TTY, json otherwise)")
  .action(async (opts) => {
    try {
      await runGraphQuery({
        nodeType: opts.nodeType,
        dirRole: opts.dirRole,
        envTag: opts.envTag,
        relation: opts.relation,
        id: opts.id,
        neighborsOf: opts.neighbors,
        limit: opts.limit,
        format: opts.format,
      });
    } catch (err) {
      console.error(pc.red(`graph query failed: ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

graphCmd
  .command("view")
  .description("Render a canonical subgraph as Mermaid, DOT, or standalone interactive HTML")
  .argument("<subgraph>", "subgraph id: sacred-doc-lineage | prd-to-impl | promotion-status | deps")
  .option("--format <format>", "output format: mermaid | dot | html (default: mermaid)")
  .option("--output <path>", "write output to file instead of stdout")
  .option("--max-nodes <n>", "cap node count (0 disables)", (v) => parseInt(v, 10))
  .option("--cytoscape-src <src>", "HTML-only: override Cytoscape.js script URL")
  .action(async (subgraph: string, opts) => {
    try {
      const code = await runGraphView({
        subgraph,
        format: opts.format,
        output: opts.output,
        maxNodes: opts.maxNodes,
        cytoscapeSrc: opts.cytoscapeSrc,
      });
      process.exit(code);
    } catch (err) {
      console.error(pc.red(`graph view failed: ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

const securityCmd = program
  .command("security")
  .description("Security-gate tooling — aggregate scanner results, query gate state");

securityCmd
  .command("aggregate")
  .description("Merge per-scanner ScanResult JSONs into a single AggregateResult; exit 0=pass, 1=fail")
  .option("--block-severity <sev>", "block threshold: critical|high|medium|low|info (default: high)")
  .option("--input-dir <path>", "directory holding scanner JSON outputs (default: _context/audit/security)")
  .option("--output <path>", "override aggregate output path")
  .option("--dry-run", "do not write aggregate file")
  .action(async (opts) => {
    try {
      const code = await runSecurityAggregate({
        blockSeverity: opts.blockSeverity,
        inputDir: opts.inputDir,
        outputPath: opts.output,
        dryRun: opts.dryRun,
      });
      process.exit(code);
    } catch (err) {
      console.error(
        pc.red(`security aggregate failed: ${err instanceof Error ? err.message : String(err)}`),
      );
      process.exit(1);
    }
  });

const runCmd = program
  .command("run")
  .description("EventStream tooling — inspect orchestration runs (§6.4)");

runCmd
  .command("list")
  .description("List recorded runs in .coldpress/runs/ (chronological, oldest first)")
  .action(async () => {
    try {
      const code = await runRunList();
      process.exit(code);
    } catch (err) {
      console.error(
        pc.red(`run list failed: ${err instanceof Error ? err.message : String(err)}`),
      );
      process.exit(1);
    }
  });

runCmd
  .command("inspect")
  .description("Render a run's event timeline as human-readable text")
  .argument("<run-id>", "the run id (see `coldpress run list`)")
  .option("--time <style>", "timestamp style: delta | absolute (default: delta)")
  .option("--no-colour", "disable ANSI colour output")
  .action(async (runId: string, opts) => {
    try {
      const code = await runRunInspect({
        runId,
        timeStyle: opts.time,
        monochrome: opts.colour === false ? true : undefined,
      });
      process.exit(code);
    } catch (err) {
      console.error(
        pc.red(`run inspect failed: ${err instanceof Error ? err.message : String(err)}`),
      );
      process.exit(1);
    }
  });

program
  .command("dashboard")
  .description("Start the localhost project dashboard (status / stats / sanity / tech-stack / to-dos / graph / quick-links)")
  .option("--port <n>", "port to bind on 127.0.0.1 (default: 7777)", (v) => parseInt(v, 10))
  .option("--open", "launch the default browser at the dashboard URL")
  .option("--poll-ms <n>", "tab refresh interval in ms (default: 10000)", (v) => parseInt(v, 10))
  .action(async (opts) => {
    try {
      await runDashboard({
        port: opts.port,
        open: opts.open === true,
        pollIntervalMs: opts.pollMs,
      });
    } catch (err) {
      console.error(
        pc.red(`dashboard failed: ${err instanceof Error ? err.message : String(err)}`),
      );
      process.exit(1);
    }
  });

const importCmd = program
  .command("import")
  .description("One-way inbound adapters (BMAD today; MetaGPT explicitly not supported)");

importCmd
  .command("bmad")
  .description("Import a BMAD module directory into the current project (lossy; review ATTRIBUTION.md)")
  .argument("<source-dir>", "path to a BMAD module directory (with config.yaml)")
  .option("--module-slug <slug>", "override the imported module's slug")
  .option("--overwrite", "overwrite existing files in the target (default: refuse)")
  .action(async (sourceDir: string, opts) => {
    const code = await runImportBmad({
      sourceDir,
      moduleSlug: opts.moduleSlug,
      overwrite: opts.overwrite,
    });
    process.exit(code);
  });

program
  .command("update")
  .description("Regenerate interop outputs (AGENTS.md, Cursor, Roo, OpenHands, Cline) for the current project")
  .action(async () => {
    try {
      await runUpdate();
    } catch (err) {
      console.error(pc.red(`update failed: ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

program
  .command("feedback")
  .description("Open the coldpress-os GitHub Issues page in your browser")
  .action(() => {
    runFeedback();
  });

program
  .command("upgrade")
  .description("Print upgrade instructions")
  .action(() => {
    console.log("To upgrade coldpress, run:");
    console.log(pc.cyan("  npm update -g @coldpress/core"));
  });

program.parse();
