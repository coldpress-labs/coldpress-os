/**
 * `coldpress visual-verify` (§5 P8) — check a page's used styles against
 * `tokens.json`. Reads `_context/design/tokens.json` + a used-styles report
 * (`_context/design/used-styles.json`, produced by the visual-verify skill's
 * Playwright computed-style extraction) and fails on any off-token value.
 * The verifier runs this; exit 1 on a violation.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TokensSchema } from "../../schemas/design/tokens.schema.js";
import { checkTokenUsage, type UsedStyles } from "../design/visual-verify.js";

export interface RunVisualVerifyOptions {
  projectDir?: string;
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
}

export function runVisualVerify(opts: RunVisualVerifyOptions = {}): number {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));
  const cwd = opts.projectDir ?? process.cwd();

  const tokensPath = join(cwd, "_context/design/tokens.json");
  const usedPath = join(cwd, "_context/design/used-styles.json");
  if (!existsSync(tokensPath)) {
    warn("visual-verify: no _context/design/tokens.json (run design-tokens in Phase 5).\n");
    return 1;
  }
  if (!existsSync(usedPath)) {
    warn("visual-verify: no _context/design/used-styles.json — run the visual-verify skill's Playwright extraction first.\n");
    return 1;
  }

  const tokens = TokensSchema.safeParse(JSON.parse(readFileSync(tokensPath, "utf8")));
  if (!tokens.success) {
    warn("visual-verify: tokens.json failed schema validation.\n");
    return 1;
  }
  const used = JSON.parse(readFileSync(usedPath, "utf8")) as UsedStyles;

  const violations = checkTokenUsage(used, tokens.data);
  if (violations.length === 0) {
    write("visual-verify OK — every used color/font/size/spacing is a token.\n");
    return 0;
  }
  warn(`visual-verify FAILED — ${violations.length} token violation(s):\n`);
  for (const v of violations) warn(`  ✗ [${v.kind}] ${v.message}\n`);
  warn("Use the design tokens (var(--…) from tokens.css) instead of ad-hoc values.\n");
  return 1;
}
