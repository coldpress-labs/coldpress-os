/**
 * `coldpress security aggregate` — aggregates per-scanner ScanResult files
 * into a single AggregateResult and emits it for phase-7 gate consumption.
 *
 * Exit-code contract (matches phase-gate evaluator):
 *   0 — overall "pass"
 *   1 — overall "fail" (≥1 unwaived finding at-or-above block_severity)
 *      OR tool error (no scanner outputs found, schema-invalid input)
 */

import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import pc from "picocolors";
import {
  type AggregateResult,
  type GatePolicy,
  type ScanResult,
  GatePolicySchema,
  ScanResultSchema,
} from "../../schemas/security-gate-result.schema.js";
import { aggregate } from "../security/aggregate.js";

export const SECURITY_AGGREGATE_EXIT_PASS = 0;
export const SECURITY_AGGREGATE_EXIT_FAIL = 1;
export const SECURITY_AGGREGATE_EXIT_ERROR = 1;

export interface AggregateCommandOptions {
  projectDir?: string;
  /** default: `_context/audit/security/` */
  inputDir?: string;
  /** default: `_context/audit/security/aggregate-<ISO-date>.json` */
  outputPath?: string;
  /** override policy.block_severity (default "high") */
  blockSeverity?: string;
  /** override — disables writing the aggregate file, prints to stdout only */
  dryRun?: boolean;
}

const SCANNER_FILE_PATTERN = /^(semgrep|gitleaks|trivy|osv|syft)-/;

export async function runSecurityAggregate(
  options: AggregateCommandOptions = {},
): Promise<number> {
  const projectDir = resolve(options.projectDir ?? process.cwd());
  const inputDir = resolve(
    projectDir,
    options.inputDir ?? "_context/audit/security",
  );

  let files: string[];
  try {
    files = await readdir(inputDir);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(
        pc.red(`no scanner outputs directory at ${inputDir}`),
      );
      console.error(
        pc.dim(
          "  Run the scanner wrappers first (scan-code, scan-secrets, " +
            "scan-deps-and-containers, scan-vulns, sbom) to populate this " +
            "directory.",
        ),
      );
      return SECURITY_AGGREGATE_EXIT_ERROR;
    }
    throw err;
  }

  const scannerFiles = files
    .filter((f) => SCANNER_FILE_PATTERN.test(f) && f.endsWith(".json"))
    .map((f) => join(inputDir, f));

  if (scannerFiles.length === 0) {
    console.error(pc.red(`no scanner ScanResult files in ${inputDir}`));
    console.error(
      pc.dim(
        "  Expected files matching (semgrep|gitleaks|trivy|osv|syft)-*.json",
      ),
    );
    return SECURITY_AGGREGATE_EXIT_ERROR;
  }

  const scanners: ScanResult[] = [];
  for (const path of scannerFiles) {
    const raw = await readFile(path, "utf8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error(pc.red(`invalid JSON in ${path}`));
      console.error(pc.dim(`  ${(err as Error).message}`));
      return SECURITY_AGGREGATE_EXIT_ERROR;
    }
    const result = ScanResultSchema.safeParse(parsed);
    if (!result.success) {
      console.error(pc.red(`schema-invalid ScanResult at ${path}`));
      for (const issue of result.error.issues) {
        console.error(
          pc.dim(`  - ${issue.path.join(".") || "(root)"}: ${issue.message}`),
        );
      }
      return SECURITY_AGGREGATE_EXIT_ERROR;
    }
    scanners.push(result.data);
  }

  const waivers = await loadWaivers(projectDir);

  const policyParse = GatePolicySchema.safeParse({
    block_severity: options.blockSeverity ?? "high",
    waivers,
  });
  if (!policyParse.success) {
    console.error(pc.red("invalid --block-severity"));
    for (const issue of policyParse.error.issues) {
      console.error(pc.dim(`  - ${issue.message}`));
    }
    return SECURITY_AGGREGATE_EXIT_ERROR;
  }
  const policy: GatePolicy = policyParse.data;

  const result = aggregate({ scanners, policy });

  if (!options.dryRun) {
    const datePart = result.aggregated_at.slice(0, 10);
    const outPath = resolve(
      projectDir,
      options.outputPath ?? `_context/audit/security/aggregate-${datePart}.json`,
    );
    await mkdir(join(outPath, ".."), { recursive: true });
    await writeFile(outPath, JSON.stringify(result, null, 2), "utf8");
    console.error(pc.dim(`wrote ${outPath}`));
  }

  printSummary(result);

  return result.overall === "pass"
    ? SECURITY_AGGREGATE_EXIT_PASS
    : SECURITY_AGGREGATE_EXIT_FAIL;
}

/**
 * Load waiver ids from `.coldpress/signoffs/security-gate/<finding-id>.yaml`.
 * Each file's presence = finding id is waived. Content (sign-off record)
 * isn't parsed here — the phase-gate protocol handles that.
 */
async function loadWaivers(projectDir: string): Promise<string[]> {
  const dir = resolve(projectDir, ".coldpress/signoffs/security-gate");
  try {
    const s = await stat(dir);
    if (!s.isDirectory()) return [];
  } catch {
    return [];
  }
  const files = await readdir(dir);
  return files
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => f.replace(/\.ya?ml$/, ""));
}

function printSummary(result: AggregateResult): void {
  const badge =
    result.overall === "pass"
      ? pc.bgGreen(pc.black(" PASS "))
      : pc.bgRed(pc.white(" FAIL "));
  console.log(`${badge} security gate — ${result.scanners.length} scanner(s)`);
  const t = result.totals;
  console.log(
    `  findings: ${pc.red(`${t.critical} critical`)}, ${pc.red(`${t.high} high`)}, ${pc.yellow(`${t.medium} medium`)}, ${t.low} low, ${t.info} info (total ${t.total})`,
  );
  console.log(`  policy.block_severity: ${result.policy.block_severity}`);
  if (result.policy.waivers.length > 0) {
    console.log(`  waivers: ${result.policy.waivers.length}`);
  }
  if (result.blockers.length > 0) {
    console.log(pc.red(`  blockers (${result.blockers.length}):`));
    for (const id of result.blockers.slice(0, 10)) {
      console.log(pc.red(`    - ${id}`));
    }
    if (result.blockers.length > 10) {
      console.log(pc.dim(`    … ${result.blockers.length - 10} more`));
    }
  }
}
