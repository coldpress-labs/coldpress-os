/**
 * `coldpress-otel-export` CLI.
 *
 * Offline / on-demand replay of `.coldpress/runs/<run-id>/events.jsonl`
 * as OTLP traces. The exporter is a sidecar over the EventStream;
 * re-running it is idempotent (deterministic trace/span IDs — see
 * ids.ts) and safe against any OTel backend that deduplicates on IDs.
 *
 * Typical invocations:
 *
 *   coldpress-otel-export --run <run-id>       # explicit run
 *   coldpress-otel-export --latest             # most recent run
 *   coldpress-otel-export --all                # all runs on disk
 *   coldpress-otel-export --list               # report runs; no emission
 *
 * Exit codes:
 *   0  OK (including "no runs on disk" which is not an error)
 *   1  Runtime failure (malformed stream / OTLP transport failure)
 *   2  Specified run not found / no --run or --latest or --all given
 */

import { Command } from "commander";
import { listRuns, readRun, EventStreamNotFoundError } from "./reader.js";
import { mapRunToSpans, type MapOptions } from "./mapper.js";
import { createOtlpExporter, exportSpans } from "./exporter.js";

interface CliOptions {
  run?: string;
  latest?: boolean;
  all?: boolean;
  list?: boolean;
  projectDir?: string;
  endpoint?: string;
  header?: string[];
  serviceName?: string;
  serviceVersion?: string;
  projectSlug?: string;
  dryRun?: boolean;
  quiet?: boolean;
}

function parseHeaders(pairs: string[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of pairs ?? []) {
    const idx = pair.indexOf("=");
    if (idx <= 0) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) out[key] = val;
  }
  return out;
}

async function resolveRunIds(opts: CliOptions): Promise<string[]> {
  const projectDir = opts.projectDir;
  if (opts.run) return [opts.run];
  if (opts.all) return await listRuns({ projectDir });
  if (opts.latest) {
    const ids = await listRuns({ projectDir });
    return ids.length > 0 ? [ids[ids.length - 1]!] : [];
  }
  return [];
}

async function runCli(argv: string[]): Promise<number> {
  const program = new Command()
    .name("coldpress-otel-export")
    .description(
      "Re-emit coldpress-os EventStream JSONL as OpenLLMetry-conformant OTLP traces.",
    )
    .option("--run <run-id>", "Specific run id to export")
    .option("--latest", "Export the most recent run")
    .option("--all", "Export every run on disk")
    .option("--list", "List runs and exit without emitting")
    .option(
      "--project-dir <path>",
      "Project directory containing .coldpress/runs/ (defaults to CWD)",
    )
    .option(
      "--endpoint <url>",
      "OTLP endpoint (overrides OTEL_EXPORTER_OTLP_ENDPOINT)",
    )
    .option(
      "--header <kv...>",
      "OTLP request header in key=value form (repeatable)",
    )
    .option(
      "--service-name <name>",
      "service.name attribute (overrides OTEL_SERVICE_NAME)",
    )
    .option("--service-version <version>", "service.version attribute")
    .option(
      "--project-slug <slug>",
      "coldpress.project_slug resource attribute",
    )
    .option("--dry-run", "Map events to spans but do not send to OTLP")
    .option("--quiet", "Suppress progress output")
    .allowExcessArguments(false)
    .exitOverride();

  program.parse(argv, { from: "user" });
  const opts = program.opts<CliOptions>();

  const log = opts.quiet ? () => {} : (msg: string) => process.stderr.write(msg + "\n");

  if (opts.list) {
    const ids = await listRuns({ projectDir: opts.projectDir });
    if (ids.length === 0) {
      log("No runs found.");
    } else {
      for (const id of ids) process.stdout.write(id + "\n");
    }
    return 0;
  }

  const runIds = await resolveRunIds(opts);
  if (runIds.length === 0) {
    if (opts.all) {
      log("No runs found.");
      return 0;
    }
    log(
      "Specify --run <id>, --latest, --all, or --list. Run with --help for options.",
    );
    return 2;
  }

  const mapOptions: MapOptions = {};
  if (opts.serviceName) mapOptions.serviceName = opts.serviceName;
  if (opts.serviceVersion) mapOptions.serviceVersion = opts.serviceVersion;
  if (opts.projectSlug) mapOptions.projectSlug = opts.projectSlug;

  const exporter = opts.dryRun
    ? null
    : createOtlpExporter({
        endpoint: opts.endpoint,
        headers: parseHeaders(opts.header),
      });

  let totalSpans = 0;
  try {
    for (const id of runIds) {
      let events;
      try {
        events = await readRun(id, { projectDir: opts.projectDir });
      } catch (err: unknown) {
        if (err instanceof EventStreamNotFoundError) {
          log(`run ${id}: not found (${err.path})`);
          return 2;
        }
        throw err;
      }
      if (events.length === 0) {
        log(`run ${id}: empty, skipping`);
        continue;
      }
      const { spans } = mapRunToSpans(events, mapOptions);
      totalSpans += spans.length;
      if (exporter) {
        await exportSpans(exporter, spans);
        log(`run ${id}: exported ${spans.length} spans`);
      } else {
        log(`run ${id}: would export ${spans.length} spans (--dry-run)`);
      }
    }
  } finally {
    if (exporter && "shutdown" in exporter) {
      await exporter.shutdown();
    }
  }

  log(`Done. ${totalSpans} spans across ${runIds.length} runs.`);
  return 0;
}

async function main(): Promise<void> {
  try {
    const code = await runCli(process.argv.slice(2));
    process.exit(code);
  } catch (err) {
    const { CommanderError } = await import("commander");
    if (err instanceof CommanderError) {
      // commander prints its own message; map help/version/parse errors to 0/2.
      process.exit(err.exitCode ?? 2);
    }
    process.stderr.write(`coldpress-otel-export: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

const isEntry = import.meta.url === `file://${process.argv[1]}`;
if (isEntry) void main();

export { runCli };
