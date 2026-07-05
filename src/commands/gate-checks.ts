/**
 * `coldpress <gate-check-verb>` — the eight gate-check verbs the phase-gate
 * runner (`src/gate/run.ts`, WS10-C1) invokes as CLI subprocesses.
 *
 * The check *functions* live tested-but-unreachable in `src/gate/checks/`;
 * `run.ts` spawns `coldpress <verb> …` for every block-severity `gate.json`
 * check, so the verbs must exist on the CLI or every gate check fails as an
 * "unknown command" (WS11 / audit S1.1). These thin wrappers run the check in
 * the project cwd, print a one-line result, and return a process exit code
 * (0 = pass, 1 = fail) — the contract `run.ts` reads.
 *
 * Verb → function map (each command string is authored in a phase `gate.json`):
 *   config-check <key>                 → configCheck
 *   validate-adrs <dir> --shortlist p  → validateAdrs
 *   validate-pack-match [file]         → validatePackMatch
 *   validate-yaml-block <file> <key>   → validateYamlBlock
 *   validate-schema-latest <glob>      → validateSchemaLatest
 *   validate-schema <file>             → validateDocSchema (single-doc)
 *   file-exists-after <glob>           → fileExistsAfter
 *   gate-check-supersessions           → checkSupersessions
 */

import { resolve } from "node:path";
import {
  configCheck,
  validateAdrs,
  validatePackMatch,
  validateYamlBlock,
  validateSchemaLatest,
  fileExistsAfter,
  checkSupersessions,
  frontmatterMin,
} from "../gate/checks/index.js";
import { validateDocSchema, type SchemaValidationIssue } from "../governance/validate-schema.js";

/** Print a check result and map ok→exit code. Keeps every verb's output uniform. */
function report(ok: boolean, message: string): number {
  const w = ok ? process.stdout : process.stderr;
  w.write(`${ok ? "✓" : "✗"} ${message}\n`);
  return ok ? 0 : 1;
}

/** Render schema issues (shared by the two schema verbs) into one line. */
function issuesLine(issues: SchemaValidationIssue[] | undefined): string {
  if (!issues || issues.length === 0) return "schema validation failed.";
  return issues.map((i) => `${i.path}: ${i.message}`).join("; ");
}

export async function runConfigCheck(
  key: string,
  opts: { allowEmptyString?: boolean; expected?: string },
): Promise<number> {
  const r = await configCheck(process.cwd(), key, {
    allowEmptyString: opts.allowEmptyString,
    expected: opts.expected,
  });
  return report(r.ok, r.message);
}

export async function runValidateAdrs(
  _adrsDir: string,
  opts: { shortlist?: string },
): Promise<number> {
  // The function hard-codes the ADR dir (_context/planning/adrs); the positional
  // arg is accepted for gate.json command-string parity and ignored.
  if (!opts.shortlist) return report(false, "validate-adrs: --shortlist <path> is required.");
  const r = await validateAdrs(process.cwd(), opts.shortlist);
  const msg = r.ok
    ? `ADRs cover the shortlist (${r.passed.length} decision area(s)).`
    : `ADR coverage gaps: ${r.failed.map((f) => `${f.area} (${f.reason})`).join("; ")}`;
  return report(r.ok, msg);
}

export async function runValidatePackMatch(_file?: string): Promise<number> {
  // The function finds the latest shortlist itself; positional arg is parity-only.
  const r = await validatePackMatch(process.cwd());
  return report(r.ok, r.message);
}

export async function runValidateYamlBlock(
  file: string,
  blockKey: string,
  opts: { schema?: string },
): Promise<number> {
  if (!opts.schema) return report(false, "validate-yaml-block: --schema <path> is required.");
  // The check resolves the schema under packageRoot/schemas/<rel>; gate.json
  // authors write it as `schemas/<rel>` (relative to package root), which would
  // double to packageRoot/schemas/schemas/<rel>. Strip a single leading
  // `schemas/` so both spellings resolve (WS11 D38-t1).
  const schemaRel = opts.schema.replace(/^schemas\//, "");
  const r = await validateYamlBlock(resolve(process.cwd(), file), blockKey, schemaRel);
  const msg = r.ok ? `${blockKey} block valid in ${file}.` : (r.message ?? issuesLine(r.issues));
  return report(r.ok, msg);
}

export async function runValidateSchemaLatest(
  glob: string,
  _opts: { schema?: string },
): Promise<number> {
  // `--schema` is accepted for gate.json parity but ignored: the schema is
  // derived from the resolved doc's path/frontmatter by validateDocSchema
  // (WS11 D38-t2).
  const r = await validateSchemaLatest(process.cwd(), glob);
  const where = r.resolved_path ? ` (${r.resolved_path})` : "";
  const msg = r.ok ? `latest ${glob} valid${where}.` : `${glob}: ${issuesLine(r.issues)}`;
  return report(r.ok, msg);
}

export async function runValidateSchema(file: string): Promise<number> {
  const r = await validateDocSchema(resolve(process.cwd(), file));
  const msg = r.ok ? `${file} valid (${r.schema_used ?? "schema"}).` : `${file}: ${issuesLine(r.issues)}`;
  return report(r.ok, msg);
}

export async function runFileExistsAfter(
  glob: string,
  opts: { afterKey?: string; afterTimestamp?: string },
): Promise<number> {
  const r = await fileExistsAfter(process.cwd(), glob, {
    afterKey: opts.afterKey,
    afterTimestamp: opts.afterTimestamp,
  });
  return report(r.ok, r.message);
}

export async function runGateCheckSupersessions(opts: { afterKey?: string }): Promise<number> {
  const r = await checkSupersessions(process.cwd(), opts.afterKey ?? "phase_3_started_at");
  return report(r.ok, r.message);
}

export async function runValidateFrontmatterMin(
  doc: string,
  field: string,
  opts: { min?: string },
): Promise<number> {
  const min = Number(opts.min ?? "1");
  if (!Number.isFinite(min) || min < 0) return report(false, `validate-frontmatter-min: invalid --min "${opts.min}".`);
  const r = await frontmatterMin(process.cwd(), doc, field, min);
  return report(r.ok, r.message);
}
