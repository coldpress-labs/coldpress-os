import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { runDashboard } from "./commands/dashboard.js";
import { runDoctor } from "./commands/doctor.js";
import { runEvalsCommand } from "./commands/evals.js";
import { runEvolve } from "./commands/evolve.js";
import { runFeedback } from "./commands/feedback.js";
import { runHook } from "./commands/hook.js";
import { runImportBmad } from "./commands/import.js";
import { runLaneUpgrade } from "./commands/lane-upgrade.js";
import { runOutcomesCheck } from "./commands/outcomes.js";
import { recordVerdict } from "./commands/verdict.js";
import { checkWiring } from "./wiring/check.js";
import { runGateCheck, runGateEnter } from "./commands/gate.js";
import {
  runConfigCheck,
  runValidateAdrs,
  runValidatePackMatch,
  runValidateYamlBlock,
  runValidateSchemaLatest,
  runValidateSchema,
  runFileExistsAfter,
  runGateCheckSupersessions,
} from "./commands/gate-checks.js";
import { runStatusLine } from "./commands/statusline.js";
import { runTokensBuild } from "./commands/tokens.js";
import { runVisualVerify } from "./commands/visual-verify.js";
import { runTrace } from "./commands/trace.js";
import { runWaves } from "./commands/waves.js";
import { type InitInput, runInit } from "./commands/init.js";
import { runRunInspect, runRunList } from "./commands/run.js";
import { runSecurityAggregate } from "./commands/security.js";
import { runLlmNormalize } from "./commands/llm-normalize.js";
import { runUpdate } from "./commands/update.js";
import { packageRoot } from "./utils/paths.js";

const pkg = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
) as { version: string };

const program = new Command();

program
  .name("coldpress")
  .description("AI-native development framework — 11-phase Shape A lifecycle, 8 subagents, atomic skills.")
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
    "Traceability over the project's schema'd artifacts (§4.6). Verbs: orphans (integrity + silent-divergence guard; exit 1 on a blocking finding), why <id>, impact <id>, coverage, release (P8→P9 release-scope preview).",
  )
  .option("--strict", "orphans: treat an empty graph (nothing to check) as a non-pass (exit 2), not a vacuous clean pass")
  .action((verb: string, id: string | undefined, opts: { strict?: boolean }) => {
    process.exit(runTrace(verb, id, { strict: opts.strict }));
  });

const outcomesCmd = program.command("outcomes").description("Outcome-contract tooling (§5 P4).");
outcomesCmd
  .command("check")
  .description("Validate _context/planning/outcomes.yaml and verify P0/P1 requirements have outcome targets (P4 gate).")
  .action(() => {
    process.exit(runOutcomesCheck());
  });

const verdictCmd = program.command("verdict").description("Clean-room verifier verdict tooling (§5 P8, WS10-A4/A5).");
verdictCmd
  .command("record <file>")
  .description("Validate a verifier verdict record + append a `verdict` EventStream event (taxonomy tags feed `coldpress evolve`).")
  .action(async (file: string) => {
    process.exit(await recordVerdict(file));
  });

const tokensCmd = program.command("tokens").description("Design-token tooling (§5 P5).");
tokensCmd
  .command("build")
  .description("Regenerate _context/design/tokens.css (CSS custom properties) from tokens.json — the code binding the build consumes by construction.")
  .action(() => {
    process.exit(runTokensBuild());
  });

program
  .command("visual-verify")
  .description("Check a page's used styles (from _context/design/used-styles.json) against tokens.json — fails on any off-token color/font/size/spacing (§5 P8).")
  .action(() => {
    process.exit(runVisualVerify());
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
  .command("evals")
  .description(
    "Run the framework golden tasks headlessly and report per-task pass/fail (§4.8). Scores deterministic checks (gates/schema/files/tests/grep/no-secret) against a workspace; exits 1 on any failure.",
  )
  .option("--dir <dir>", "golden-task directory (default: <project>/evals)")
  .option("--workspace <dir>", "workspace the checks score against (default: project dir)")
  .option("--filter <substr>", "only run tasks whose id includes this substring")
  .option("--json", "emit the machine-readable report")
  .action((opts: { dir?: string; workspace?: string; filter?: string; json?: boolean }) => {
    process.exit(
      runEvalsCommand({ dir: opts.dir, workspace: opts.workspace, filter: opts.filter, json: opts.json }),
    );
  });

program
  .command("evolve")
  .description(
    "Aggregate EventStream run-logs across ≥1 project into the evolution report (§4.8): failure + cost leaderboards, estimation bias, and top-3 patch proposals.",
  )
  .option("--project <dirs...>", "project roots to aggregate (default: current dir)")
  .option("--json", "emit the machine-readable report")
  .action(async (opts: { project?: string[]; json?: boolean }) => {
    process.exit(await runEvolve({ projects: opts.project, json: opts.json }));
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
  .option("--wiring", "also run the wiring-manifest check (every cross-phase artifact has a producer + resolvable consumers/schema)")
  .option("--structure", "also run the structure check (shipped dirs exist, data files have readers, skills are routed or on-demand, no internal-state leak)")
  .option("--verbose", "show extra detail on every check")
  .action(async (opts: { stack?: boolean; wiring?: boolean; structure?: boolean; verbose?: boolean }) => {
    try {
      const { exitCode } = await runDoctor({ stack: opts.stack, wiring: opts.wiring, structure: opts.structure, verbose: opts.verbose });
      process.exit(exitCode);
    } catch (err) {
      console.error(pc.red(`doctor failed: ${err instanceof Error ? err.message : String(err)}`));
      process.exit(1);
    }
  });

const gateCmd = program.command("gate").description("Phase-gate runner (WS10-C1): evaluate a phase's gate.json checks + stamp phase-entry timestamps.");
gateCmd
  .command("check <phase>")
  .description("Evaluate lifecycle/<phase>/gate.json — run each check's command, existence-check artefacts, surface human/agent checks as pending. Exit 1 iff a block-severity check failed.")
  .action((phase: string) => {
    process.exit(runGateCheck(phase));
  });
gateCmd
  .command("enter <phase>")
  .description("Stamp phase_<n>_started_at in .coldpress/local-config.yaml (fresh-for-phase key read by file-exists-after gate checks).")
  .action(async (phase: string) => {
    process.exit(await runGateEnter(phase));
  });

const wiringCmd = program.command("wiring").description("Cross-phase wiring manifest tooling (WS10-G).");
wiringCmd
  .command("check")
  .description("Assert every cross-phase artifact in data/wiring.yaml has a producer + resolvable consumers/schema.")
  .action(() => {
    const results = checkWiring();
    let errors = 0;
    for (const r of results) {
      const mark = r.severity === "error" ? "✗" : r.severity === "warning" ? "⚠" : "✓";
      process.stdout.write(`  ${mark} ${r.label}${r.detail ? ` — ${r.detail}` : ""}\n`);
      if (r.severity === "error") errors++;
    }
    process.exit(errors > 0 ? 1 : 0);
  });

// ── Gate-check verbs (WS11 S1.1) ───────────────────────────────────────────
// The eight acceptance-check verbs the phase-gate runner (`coldpress gate check`)
// invokes as CLI subprocesses for each `gate.json` `command`. Without these,
// every block-severity gate check fails as "unknown command". Thin wrappers in
// ./commands/gate-checks.ts run the tested check functions in the project cwd.

program
  .command("config-check <key>")
  .description("Gate check: assert a .coldpress/local-config.yaml key is set (optionally equal to --expected).")
  .option("--allow-empty-string", "treat an explicit empty string as a pass")
  .option("--expected <value>", "require the key to equal this value")
  .action(async (key: string, opts: { allowEmptyString?: boolean; expected?: string }) => {
    process.exit(await runConfigCheck(key, opts));
  });

program
  .command("validate-adrs <adrsDir>")
  .description("Gate check: assert ADRs cover every decision area in the stack shortlist.")
  .option("--shortlist <path>", "path to the stack-shortlist file")
  .action(async (adrsDir: string, opts: { shortlist?: string }) => {
    process.exit(await runValidateAdrs(adrsDir, opts));
  });

program
  .command("validate-pack-match [file]")
  .description("Gate check: assert the latest stack-shortlist resolved a pack_match.")
  .action(async (file: string | undefined) => {
    process.exit(await runValidatePackMatch(file));
  });

program
  .command("validate-yaml-block <file> <blockKey>")
  .description("Gate check: validate a named top-level YAML block against a schema.")
  .option("--schema <path>", "schema path (relative to the framework schemas/ dir)")
  .action(async (file: string, blockKey: string, opts: { schema?: string }) => {
    process.exit(await runValidateYamlBlock(file, blockKey, opts));
  });

program
  .command("validate-schema-latest <glob>")
  .description("Gate check: resolve a v{N} glob to its highest version and schema-validate it.")
  .option("--schema <path>", "accepted for gate.json parity; schema is derived from the doc")
  .action(async (glob: string, opts: { schema?: string }) => {
    process.exit(await runValidateSchemaLatest(glob, opts));
  });

program
  .command("validate-schema <file>")
  .description("Gate check: schema-validate a single doc (sacred-doc or path-pattern resolved).")
  .action(async (file: string) => {
    process.exit(await runValidateSchema(file));
  });

program
  .command("file-exists-after <glob>")
  .description("Gate check: assert a file matching <glob> exists, freshly created since --after-key/--after-timestamp.")
  .option("--after-key <key>", "local-config key holding the reference ISO timestamp (e.g. phase_3_started_at)")
  .option("--after-timestamp <iso>", "explicit reference ISO timestamp")
  .action(async (glob: string, opts: { afterKey?: string; afterTimestamp?: string }) => {
    process.exit(await runFileExistsAfter(glob, opts));
  });

program
  .command("gate-check-supersessions")
  .description("Gate check: assert any supersession logs in this phase post-date --after-key.")
  .option("--after-key <key>", "local-config key holding the phase-start timestamp", "phase_3_started_at")
  .action(async (opts: { afterKey?: string }) => {
    process.exit(await runGateCheckSupersessions(opts));
  });

program
  .command("llm-normalize <tool> <raw-file>")
  .description("Normalize a native LLM-eval tool's output (deepeval|giskard|promptfoo) into a ScanResult the security aggregator consumes (§5.5, verify_pack: llm-app).")
  .option("--target <name>", "the eval target name recorded in the ScanResult", "llm-app")
  .option("--fail-severity <sev>", "severity assigned to failing metrics: critical|high|medium|low|info", "high")
  .option("--out <path>", "write the ScanResult here (default: stdout)")
  .action((tool: string, rawFile: string, opts: { target?: string; failSeverity?: string; out?: string }) => {
    process.exit(runLlmNormalize(tool, rawFile, opts));
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
