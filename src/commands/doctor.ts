import { resolve } from "node:path";
import pc from "picocolors";
import {
  type CheckResult,
  type CheckSuiteResult,
  exitCodeFor,
  runCoreChecks,
  runStackChecks,
} from "../utils/doctor-checks.js";
import { checkWiring } from "../wiring/check.js";
import { checkStructure } from "../structure/check.js";

export interface DoctorOptions {
  /** When true, include stack-pack-specific checks (reads coldpress.yaml). */
  stack?: boolean;
  /** When true, run the WS10-G wiring-manifest check (producer/consumer/schema). */
  wiring?: boolean;
  /** When true, run the WS11 §S7.7 structure check (shipped dirs / data readers / skill routing / no internal-state leak). */
  structure?: boolean;
  /** Extra detail on each check in the output. */
  verbose?: boolean;
  /** Suppress all output (used by init pre-flight). */
  silent?: boolean;
  /** Override project root — defaults to process.cwd(). */
  projectRoot?: string;
}

export interface DoctorRunResult {
  exitCode: 0 | 1 | 2;
  suite: CheckSuiteResult;
  stackSuite?: CheckSuiteResult;
}

/**
 * Run the environment health check suite. Silent mode returns the suite
 * without printing anything — callers decide how to surface results.
 */
export async function runDoctor(opts: DoctorOptions = {}): Promise<DoctorRunResult> {
  const projectRoot = opts.projectRoot ?? process.cwd();

  const core = await runCoreChecks();
  let stackSuite: CheckSuiteResult | undefined;
  if (opts.stack) {
    stackSuite = await runStackChecks({ projectRoot });
  }
  const wiringResults: CheckResult[] = opts.wiring ? checkWiring() : [];
  const structureResults: CheckResult[] = opts.structure ? checkStructure() : [];

  const extra = [...(stackSuite?.results ?? []), ...wiringResults, ...structureResults];
  const combined: CheckSuiteResult = {
    results: [...core.results, ...extra],
    hasError: core.hasError || extra.some((r) => r.severity === "error"),
    hasWarning: core.hasWarning || extra.some((r) => r.severity === "warning"),
  };

  if (!opts.silent) {
    printReport(combined, {
      verbose: opts.verbose ?? false,
      stackRun: opts.stack === true,
    });
  }

  return {
    exitCode: exitCodeFor(combined),
    suite: core,
    stackSuite,
  };
}

function printReport(
  suite: CheckSuiteResult,
  opts: { verbose: boolean; stackRun: boolean },
): void {
  const header = opts.stackRun
    ? "coldpress doctor — core + stack checks"
    : "coldpress doctor — core checks";
  console.log(pc.bold(header));
  console.log("");

  for (const result of suite.results) {
    console.log(`  ${glyph(result.severity)} ${result.label}`);
    if (result.detail && (opts.verbose || result.severity !== "ok")) {
      console.log(pc.dim(`      ${result.detail}`));
    }
    if (result.remedy && result.severity !== "ok") {
      console.log(pc.dim(`      → ${result.remedy}`));
    }
  }

  console.log("");
  console.log(summaryLine(suite));
}

function glyph(severity: CheckResult["severity"]): string {
  if (severity === "ok") return pc.green("✓");
  if (severity === "warning") return pc.yellow("⚠");
  return pc.red("✗");
}

function summaryLine(suite: CheckSuiteResult): string {
  if (suite.hasError) return pc.red("✗ one or more critical tools missing");
  if (suite.hasWarning) return pc.yellow("⚠ warnings only — proceed with care");
  return pc.green("✓ all checks passed");
}
