import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { runFeedback } from "./commands/feedback.js";
import { runInit } from "./commands/init.js";
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
