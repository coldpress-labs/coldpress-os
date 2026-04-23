import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import pc from "picocolors";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8"),
) as { version: string };

const program = new Command();

program
  .name("coldpress")
  .description("AI-native development framework — 9-phase lifecycle, 9 subagents, atomic skills.")
  .version(pkg.version, "-v, --version", "output the current version");

program
  .command("init")
  .description("Scaffold a new coldpress-os project")
  .argument("[project-name]", "name of the project to create")
  .action((projectName?: string) => {
    console.log(pc.yellow(`coldpress init${projectName ? ` ${projectName}` : ""} — not yet implemented (Block G)`));
    process.exitCode = 1;
  });

program
  .command("feedback")
  .description("Open the GitHub Issues page in your browser")
  .action(() => {
    console.log(pc.yellow("coldpress feedback — not yet implemented (Block G)"));
    process.exitCode = 1;
  });

program
  .command("upgrade")
  .description("Print upgrade instructions")
  .action(() => {
    console.log("To upgrade coldpress, run:");
    console.log(pc.cyan("  npm update -g @coldpress/core"));
  });

program.parse();
