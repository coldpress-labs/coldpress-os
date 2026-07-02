import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { runDashboard } from "./commands/dashboard.js";
import { runDoctor } from "./commands/doctor.js";
import { runFeedback } from "./commands/feedback.js";
import { runHook } from "./commands/hook.js";
import { runImportBmad } from "./commands/import.js";
import { runLaneUpgrade } from "./commands/lane-upgrade.js";
import { runStatusLine } from "./commands/statusline.js";
import { runTrace } from "./commands/trace.js";
import { runWaves } from "./commands/waves.js";
import { type InitInput, runInit } from "./commands/init.js";
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
  .description("AI-native development framework — 11-phase Shape A lifecycle, 11 subagents, atomic skills.")
  .version(pkg.version, "-v, --version", "output the current version");

program
  .command("init")
  .description("Scaffold a new coldpress-os project in a new directory")
  .argument("[project-name]", "name of the project to create (otherwise prompted)")
  .option("--yes", "non-interactive mode — skip prompts; requires --name/--slug/--user")
  .option("--name <name>", "project name (used with --yes)")
  .option("--slug <slug>", "project slug in kebab-case (used with --yes)")
  .option("--user <user>", "your name, used in Butler's prose (used with --yes)")
  .option("--retrofit", "layer coldpress-os onto the current directory (existing repo)")
  .option(
    "--interop <set>",
    "filter interop outputs: none|claude|cursor|roo|openhands|cline|all (default: all)",
  )
  .option("--no-git-init", "skip `git init` + seed commit after scaffolding")
  .option("--skip-doctor", "skip the pre-flight `coldpress doctor` check")
  .option("--lane <lane>", "ceremony lane: lite (default) | full")
  .action(
    async (
      projectNameArg: string | undefined,
      opts: {
        yes?: boolean;
        name?: string;
        slug?: string;
        user?: string;
        retrofit?: boolean;
        interop?: string;
        gitInit?: boolean;
        skipDoctor?: boolean;
        lane?: string;
      },
    ) => {
      try {
        await runInit({
          projectNameArg,
          yes: opts.yes,
          name: opts.name,
          slug: opts.slug,
          user: opts.user,
          retrofit: opts.retrofit,
          interop: opts.interop as InitInput["interop"],
          noGitInit: opts.gitInit === false,
          skipDoctor: opts.skipDoctor,
          lane: opts.lane === "full" ? "full" : "lite",
        });
      } catch (err) {
        console.error(pc.red(`init failed: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    },
  );

// `coldpress graph` verbs (rebuild|stats|query|view) removed in v0.4 WS0
// §8 item 1 — vendored Graphify retired. Retrieval/traceability moves to
// `coldpress trace` (WS2, §4.6); AST indexing demotes to the brownfield
// capability pack (§7.6).

program
  .command("trace <verb> [id]")
  .description(
    "Traceability over the project's schema'd artifacts (§4.6). Verbs: orphans (integrity + silent-divergence guard; exit 1 on a blocking finding), why <id>, impact <id>, coverage.",
  )
  .action((verb: string, id: string | undefined) => {
    process.exit(runTrace(verb, id));
  });

program
  .command("statusline")
  .description("Print the one-line orchestration status (lane · phase · tier · enforcement · gates) for Claude Code's statusLine.")
  .action(() => {
    process.exit(runStatusLine());
  });

program
  .command("lane-upgrade")
  .description(
    "Promote a lite-lane project to the full lane without data loss (§6): flips lane in coldpress.yaml + state.yaml and back-fills the full-lane sacred-doc skeletons from spec.md (which is preserved).",
  )
  .action(() => {
    process.exit(runLaneUpgrade());
  });

program
  .command("waves")
  .description(
    "Validate the story graph and emit the derived wave plan (§4.7). Rejects cycles, missing contract stories, and intra-wave ownership overlaps; writes docs/generated/{waves,schedule}.yaml + mermaid.",
  )
  .action(() => {
    process.exit(runWaves());
  });

program
  .command("hook [name]")
  .description(
    "Run an enforcement hook (invoked by .claude/settings.json via scripts/hooks/*.mjs). Reads the Claude Code hook payload on stdin.",
  )
  .option("--explain", "print what this hook enforces, then exit")
  .option("--list", "list registered hook names")
  .action(async (name: string | undefined, opts: { explain?: boolean; list?: boolean }) => {
    if (opts.list || !name) {
      const { hookNames } = await import("./hooks/registry.js");
      console.log(hookNames().join("\n"));
      process.exit(0);
    }
    const code = await runHook(name, { explain: opts.explain });
    process.exit(code);
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
  .option(
    "--post-phase-3",
    "post-Phase-3 mode: regen stack-pack skill wrappers + run doctor --stack",
  )
  .option(
    "--post-phase-4",
    "post-Phase-4 mode: re-prime graph after PRD lock so Phase 5/6 skills start with fresh context",
  )
  .action(async (opts: { postPhase3?: boolean; postPhase4?: boolean }) => {
    try {
      await runUpdate({ postPhase3: opts.postPhase3, postPhase4: opts.postPhase4 });
    } catch (err) {
      console.error(pc.red(`update failed: ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

program
  .command("doctor")
  .description("Verify the local environment: Node, package manager, git, Claude Code CLI")
  .option("--stack", "also verify stack-specific tools (reads coldpress.yaml stack_pack)")
  .option("--verbose", "show extra detail on every check")
  .action(async (opts: { stack?: boolean; verbose?: boolean }) => {
    try {
      const { exitCode } = await runDoctor({ stack: opts.stack, verbose: opts.verbose });
      process.exit(exitCode);
    } catch (err) {
      console.error(pc.red(`doctor failed: ${err instanceof Error ? err.message : String(err)}`));
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

// POST-v0.3 — `coldpress regen <artefact>` command spec
//
// Explicit on-demand regeneration trigger for validated-distillate tier artefacts.
// Pairs with the automatic mtime-detection in `phase-transition` Step 3a (FP15) which
// auto-prompts when a prior distillate is stale relative to its upstream artefacts.
//
// Planned subcommands (one per versioned distillate):
//   coldpress regen planning-scope   — regenerates _context/planning/planning-scope-v{N}.md
//                                      via planning-entry-sync (Phase 4 re-entry).
//                                      Reads tech-stack.md + product-brief + Phase 2+3 bundle;
//                                      emits updated scope memo with incremented version.
//   coldpress regen product-brief    — regenerates _context/planning/product-brief-v{N}.md
//                                      via product-brief skill (Phase 2 re-entry)
//   coldpress regen stack-selection-summary — regenerates stack-selection-summary-v{N}.md
//
// Routing: each subcommand reads coldpress.yaml to verify the required upstream phase is
// complete before triggering the re-run. Refuses + explains if prerequisites are unmet.
//
// Implementation target: Part 4 completion or post-v0.3 CLI additions pass (whichever comes
// first). See forward-carry in docs/phase-iI-implementation-plan.md §Forward carries.

program.parse();
