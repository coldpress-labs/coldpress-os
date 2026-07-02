/**
 * `coldpress tokens build` (§5 P5) — read `_context/design/tokens.json`, validate
 * it, and regenerate `_context/design/tokens.css` (the code binding). Run whenever
 * tokens change; the generated CSS is committed so the build imports it directly.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TokensSchema } from "../../schemas/design/tokens.schema.js";
import { buildCss } from "../design/tokens-build.js";

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
