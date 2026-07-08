/**
 * `coldpress tokens build` (§5 P5) — read `_context/design/tokens.json`, validate
 * it, and regenerate `_context/design/tokens.css` (the code binding). Run whenever
 * tokens change; the generated CSS is committed so the build imports it directly.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TokensSchema } from "../../schemas/design/tokens.schema.js";
import { buildCss } from "../design/tokens-build.js";
import { checkTokenContrast } from "../design/contrast.js";

export interface RunTokensBuildOptions {
  projectDir?: string;
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
}

export function runTokensBuild(opts: RunTokensBuildOptions = {}): number {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));
  const cwd = opts.projectDir ?? process.cwd();

  const tokensPath = join(cwd, "_context/design/tokens.json");
  if (!existsSync(tokensPath)) {
    warn("tokens build: no _context/design/tokens.json. Run the design-tokens skill (Phase 5) first.\n");
    return 1;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(tokensPath, "utf8"));
  } catch (e) {
    warn(`tokens build: tokens.json is not valid JSON: ${e instanceof Error ? e.message : String(e)}\n`);
    return 1;
  }
  const parsed = TokensSchema.safeParse(raw);
  if (!parsed.success) {
    warn("tokens build: tokens.json failed schema validation:\n");
    for (const i of parsed.error.issues.slice(0, 12)) warn(`  ${i.path.join(".")}: ${i.message}\n`);
    return 1;
  }

  const css = buildCss(parsed.data);
  const outDir = join(cwd, "_context/design");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "tokens.css");
  writeFileSync(outPath, css, "utf8");

  const varCount = (css.match(/--[a-z]/g) ?? []).length;
  write(`tokens build OK — wrote _context/design/tokens.css (${varCount} custom properties).\n`);
  return 0;
}

/**
 * `coldpress tokens contrast` (VP2 O23) — read + schema-validate tokens.json, then
 * check WCAG contrast over `color.roles`. Exit 0 = all pairs pass; 1 = a failing
 * pair (or no background role to check against). Wired as a block check in the
 * Phase-5 gate so "contrast-validated at the gate" is real, not prose.
 */
export function runTokensContrast(opts: RunTokensBuildOptions = {}): number {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));
  const cwd = opts.projectDir ?? process.cwd();

  const tokensPath = join(cwd, "_context/design/tokens.json");
  if (!existsSync(tokensPath)) {
    // No design tokens → nothing to contrast-check (a non-UI project). Skip-pass so
    // the Phase-5 gate check doesn't false-block; UI projects have tokens.json.
    write("tokens contrast: no _context/design/tokens.json — no design tokens to check (non-UI project); skipping.\n");
    return 0;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(tokensPath, "utf8"));
  } catch (e) {
    warn(`tokens contrast: tokens.json is not valid JSON: ${e instanceof Error ? e.message : String(e)}\n`);
    return 1;
  }
  const parsed = TokensSchema.safeParse(raw);
  if (!parsed.success) {
    warn("tokens contrast: tokens.json failed schema validation (run `coldpress tokens build` for details).\n");
    return 1;
  }

  const report = checkTokenContrast(parsed.data, { theme: "light" });
  if (report.backgrounds.length === 0) {
    warn(
      "tokens contrast: no background role found (expected a role named bg/surface/canvas/…) — cannot validate contrast.\n",
    );
    return 1;
  }
  for (const s of report.skipped) {
    warn(`  ⚠ skipped ${s.role} (${s.value}) — ${s.reason}\n`);
  }
  if (report.failures.length > 0) {
    warn(`tokens contrast: ${report.failures.length} failing pair(s) (WCAG 2.1 AA — text 4.5:1, non-text 3:1):\n`);
    for (const f of report.failures) {
      warn(`  ✗ ${f.fg} on ${f.bg}: ${f.ratio}:1 (needs ${f.required}:1, ${f.kind})\n`);
    }
    return 1;
  }
  write(
    `tokens contrast OK — ${report.pairs.length} pair(s) across ${report.backgrounds.length} background(s), 0 failures ` +
      `(WCAG 2.1 AA: text ≥4.5:1, non-text ≥3:1).\n`,
  );
  return 0;
}
