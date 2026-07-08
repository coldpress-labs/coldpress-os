/**
 * WCAG contrast validation over design tokens (VP2 O23).
 *
 * The framework is accessibility-first (WCAG 2.1 AA is a blocking baseline), but
 * until now nothing computed contrast — `@ux-designer` and Butler hand-rolled it.
 * This module computes WCAG relative-luminance contrast ratios over the token
 * `color.roles` and checks each foreground role against each background role:
 *   - text roles          → ≥ 4.5:1 (SC 1.4.3 normal text)
 *   - non-text / UI roles  → ≥ 3.0:1 (SC 1.4.11 non-text contrast: borders, focus
 *                            rings, icons, state markers, etc.)
 * Roles named as context-specific inverses (`*-inverse`, `on-dark`, `on-primary`…)
 * are skipped for the general-background sweep — they pair with their own surface.
 */

import type { Tokens } from "../../schemas/design/tokens.schema.js";

export interface ContrastPair {
  fg: string;
  bg: string;
  ratio: number;
  required: number;
  kind: "text" | "non-text";
  pass: boolean;
}

export interface ContrastReport {
  theme: "light" | "dark";
  backgrounds: string[];
  pairs: ContrastPair[];
  failures: ContrastPair[];
  skipped: { role: string; value: string; reason: string }[];
}

const BG_WORDS = new Set(["bg", "background", "surface", "canvas", "paper", "base"]);
const TEXT_RE = /(^|[-_.])(text|fg|foreground|ink|body|heading|title|label|caption|muted|link|prose)([-_.]|$|\d)/i;
const SKIP_ON_BG = /(inverse|on[-_.]?(dark|light|primary|accent|danger|surface|color|brand)|dark[-_.]?mode)/i;

function segments(name: string): string[] {
  return name.split(/[-_.]/).filter(Boolean).map((s) => s.toLowerCase());
}
/** A background is *global* when its FIRST segment is a bg word (bg, surface, surface-alt…). */
function isGlobalBg(name: string): boolean {
  return BG_WORDS.has(segments(name)[0] ?? "");
}
/** A background is *scoped* when it ENDS in a bg word but is not global (e.g. ai-caption-bg). */
function isScopedBg(name: string): boolean {
  const segs = segments(name);
  return !isGlobalBg(name) && BG_WORDS.has(segs[segs.length - 1] ?? "");
}
function isBg(name: string): boolean {
  return isGlobalBg(name) || isScopedBg(name);
}
/** The scope prefix of a scoped background: `ai-caption-bg` → `ai-caption`. */
function scopeOf(name: string): string {
  return name.replace(/[-_.](bg|background|surface|canvas|paper|base)$/i, "").toLowerCase();
}

/** Parse `#rgb` / `#rrggbb` (with/without `#`) to [r,g,b] in 0-255, or null. */
export function parseHex(color: string): [number, number, number] | null {
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(color.trim());
  if (!m) return null;
  let hex = m[1]!;
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const n = Number.parseInt(hex, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function channelLuminance(c8: number): number {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of an sRGB color. */
export function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(channelLuminance) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two sRGB colors (1–21). */
export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Compute the contrast report for a token set's `color.roles` in one theme. */
export function checkTokenContrast(tokens: Tokens, opts: { theme?: "light" | "dark" } = {}): ContrastReport {
  const theme = opts.theme ?? "light";
  const skipped: ContrastReport["skipped"] = [];
  const resolved: { name: string; rgb: [number, number, number] }[] = [];

  for (const [name, role] of Object.entries(tokens.color.roles)) {
    const value = theme === "dark" ? (role.dark ?? role.light) : role.light;
    const rgb = parseHex(value);
    if (!rgb) {
      skipped.push({ role: name, value, reason: "not a hex color (contrast needs #rgb/#rrggbb)" });
      continue;
    }
    resolved.push({ name, rgb });
  }

  const globalBgs = resolved.filter((r) => isGlobalBg(r.name));
  const scopedBgs = resolved.filter((r) => isScopedBg(r.name)).map((r) => ({ role: r, scope: scopeOf(r.name) }));
  const foregrounds = resolved.filter((r) => !isBg(r.name));

  const pairs: ContrastPair[] = [];
  const push = (fg: (typeof resolved)[number], bg: (typeof resolved)[number]) => {
    const kind: "text" | "non-text" = TEXT_RE.test(fg.name) ? "text" : "non-text";
    const required = kind === "text" ? 4.5 : 3.0;
    const ratio = Math.round(contrastRatio(fg.rgb, bg.rgb) * 100) / 100;
    pairs.push({ fg: fg.name, bg: bg.name, ratio, required, kind, pass: ratio >= required });
  };

  for (const fg of foregrounds) {
    // Scope-match first: a foreground that belongs to a scoped surface
    // (ai-caption-text → ai-caption-bg) is checked ONLY against that surface.
    const scoped = scopedBgs.find((sb) => fg.name.toLowerCase().startsWith(`${sb.scope}-`));
    if (scoped) {
      push(fg, scoped.role);
      continue;
    }
    // Otherwise it's a general foreground: check against every global background,
    // unless it's a context-specific inverse (on-dark / on-primary / …).
    if (SKIP_ON_BG.test(fg.name)) continue;
    for (const bg of globalBgs) push(fg, bg);
  }

  return {
    theme,
    backgrounds: [...globalBgs, ...scopedBgs.map((s) => s.role)].map((b) => b.name),
    pairs,
    failures: pairs.filter((p) => !p.pass),
    skipped,
  };
}
