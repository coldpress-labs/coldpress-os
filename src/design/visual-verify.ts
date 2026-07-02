/**
 * `visual-verify` core (action plan §5 P5/P8) — the token-conformance check.
 *
 * Given the styles a page actually uses (extracted by Playwright at runtime) and
 * the design `tokens.json`, flag every value that is NOT a token: an off-palette
 * color, a font family outside the token set, a font size not in the type scale,
 * a spacing value not on the scale. This is how the styleguide is *load-bearing*
 * rather than merely asserted — divergence surfaces as a failing check.
 */

import type { Tokens } from "../../schemas/design/tokens.schema.js";

/** Styles observed on a rendered page (from computed-style extraction). */
export interface UsedStyles {
  colors?: string[];
  fontFamilies?: string[];
  fontSizes?: (string | number)[];
  spacings?: (string | number)[];
}

export interface TokenViolation {
  kind: "color" | "font-family" | "font-size" | "spacing";
  value: string;
  message: string;
}

function normColor(c: string): string {
  let v = c.trim().toLowerCase().replace(/\s+/g, "");
  const m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(v);
  if (m) v = `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}`; // expand #abc → #aabbcc
  return v;
}

function normDim(v: string | number): string {
  return (typeof v === "number" ? `${v}px` : v).trim().toLowerCase();
}

/** Primary font family (before the first comma), unquoted + lowercased. */
function primaryFamily(f: string): string {
  return (f.split(",")[0] ?? "").trim().toLowerCase().replace(/^["']|["']$/g, "");
}

/** Flag every used value that is not backed by a token. Pure. */
export function checkTokenUsage(used: UsedStyles, tokens: Tokens): TokenViolation[] {
  const violations: TokenViolation[] = [];

  const allowedColors = new Set(
    [
      ...Object.values(tokens.color.roles).flatMap((r) => [r.light, r.dark].filter((x): x is string => !!x)),
      ...Object.values(tokens.color.palette ?? {}),
    ].map(normColor),
  );
  for (const c of used.colors ?? []) {
    if (!allowedColors.has(normColor(c))) violations.push({ kind: "color", value: c, message: `color ${c} is off-palette (no matching token)` });
  }

  const allowedFamilies = new Set(Object.values(tokens.typography.families).map(primaryFamily));
  for (const f of used.fontFamilies ?? []) {
    if (!allowedFamilies.has(primaryFamily(f))) violations.push({ kind: "font-family", value: f, message: `font-family "${f}" is not a token family` });
  }

  const allowedSizes = new Set(Object.values(tokens.typography.sizes).map(normDim));
  for (const s of used.fontSizes ?? []) {
    if (!allowedSizes.has(normDim(s))) violations.push({ kind: "font-size", value: String(s), message: `font-size ${normDim(s)} is not in the type scale` });
  }

  const allowedSpacings = new Set(Object.values(tokens.spacing).map(normDim));
  for (const sp of used.spacings ?? []) {
    if (!allowedSpacings.has(normDim(sp))) violations.push({ kind: "spacing", value: String(sp), message: `spacing ${normDim(sp)} is not on the spacing scale` });
  }

  return violations;
}
