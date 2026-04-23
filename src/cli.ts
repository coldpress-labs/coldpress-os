import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { runFeedback } from "./commands/feedback.js";
import { runGraphRebuild, runGraphStats } from "./commands/graph.js";
import { runInit } from "./commands/init.js";
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
