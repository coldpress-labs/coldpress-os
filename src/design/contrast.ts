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
/** Decorative compositing layers — not foregrounds that must meet a contrast ratio. */
const LAYER_EFFECT_RE = /(shadow|scrim|overlay|backdrop|gradient|veil|tint)/i;
/** Focus indicators must meet 3:1 (SC 1.4.11 / 2.4.11) even if named like an effect. */
const FOCUS_RE = /(focus|ring|outline)/i;

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

/** An sRGB colour with alpha (0-1). */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
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

function hueToRgb(p: number, q: number, tRaw: number): number {
  let t = tRaw;
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/** Numbers inside a css function: handles `,` and space/slash separated forms. */
function fnArgs(body: string): string[] {
  return body.replace(/\//g, " ").split(/[\s,]+/).filter(Boolean);
}

function num(tok: string, scale = 1): number {
  if (tok.endsWith("%")) return (Number.parseFloat(tok) / 100) * scale;
  return Number.parseFloat(tok);
}

/**
 * Parse any token colour the design system realistically uses (VP2 O41):
 * `#rgb`/`#rgba`/`#rrggbb`/`#rrggbbaa`, `rgb()/rgba()`, `hsl()/hsla()`.
 * Returns sRGB 0-255 + alpha 0-1, or null when unparseable.
 */
export function parseColor(input: string): Rgba | null {
  const s = input.trim().toLowerCase();

  const hex = /^#?([0-9a-f]{3,8})$/.exec(s);
  if (hex) {
    let h = hex[1]!;
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    return {
      r: Number.parseInt(h.slice(0, 2), 16),
      g: Number.parseInt(h.slice(2, 4), 16),
      b: Number.parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? Number.parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = /^rgba?\(([^)]+)\)$/.exec(s);
  if (rgb) {
    const p = fnArgs(rgb[1]!);
    if (p.length < 3) return null;
    return {
      r: Math.round(num(p[0]!, 255)),
      g: Math.round(num(p[1]!, 255)),
      b: Math.round(num(p[2]!, 255)),
      a: p[3] === undefined ? 1 : num(p[3], 1),
    };
  }

  const hsl = /^hsla?\(([^)]+)\)$/.exec(s);
  if (hsl) {
    const p = fnArgs(hsl[1]!);
    if (p.length < 3) return null;
    const h = ((Number.parseFloat(p[0]!) % 360) + 360) % 360 / 360;
    const sat = num(p[1]!, 1);
    const l = num(p[2]!, 1);
    const a = p[3] === undefined ? 1 : num(p[3], 1);
    if (sat === 0) {
      const v = Math.round(l * 255);
      return { r: v, g: v, b: v, a };
    }
    const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
    const p2 = 2 * l - q;
    return {
      r: Math.round(hueToRgb(p2, q, h + 1 / 3) * 255),
      g: Math.round(hueToRgb(p2, q, h) * 255),
      b: Math.round(hueToRgb(p2, q, h - 1 / 3) * 255),
      a,
    };
  }

  return null;
}

/** Composite a (possibly translucent) foreground over an opaque background. */
export function composite(fg: Rgba, bg: [number, number, number]): [number, number, number] {
  const a = Math.min(Math.max(fg.a, 0), 1);
  return [
    Math.round(fg.r * a + bg[0] * (1 - a)),
    Math.round(fg.g * a + bg[1] * (1 - a)),
    Math.round(fg.b * a + bg[2] * (1 - a)),
  ];
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
  const resolved: { name: string; c: Rgba }[] = [];

  for (const [name, role] of Object.entries(tokens.color.roles)) {
    const value = theme === "dark" ? (role.dark ?? role.light) : role.light;
    const c = parseColor(value);
    if (!c) {
      skipped.push({ role: name, value, reason: "unparseable colour (expected hex, rgb()/rgba() or hsl()/hsla())" });
      continue;
    }
    resolved.push({ name, c });
  }

  const isOpaque = (r: { c: Rgba }) => r.c.a >= 0.999;

  // A background must be opaque to serve as a contrast baseline.
  for (const r of resolved.filter((x) => isBg(x.name) && !isOpaque(x))) {
    skipped.push({
      role: r.name,
      value: `alpha ${r.c.a}`,
      reason: "translucent background — no fixed contrast baseline to measure against",
    });
  }
  const globalBgs = resolved.filter((r) => isGlobalBg(r.name) && isOpaque(r));
  const scopedBgs = resolved
    .filter((r) => isScopedBg(r.name) && isOpaque(r))
    .map((r) => ({ role: r, scope: scopeOf(r.name) }));

  // Pure layer effects (shadows/scrims/overlays) are not contrast-bearing
  // foregrounds — unless the token is a focus indicator (SC 1.4.11 / 2.4.11).
  const foregrounds = resolved.filter((r) => {
    if (isBg(r.name)) return false;
    if (LAYER_EFFECT_RE.test(r.name) && !FOCUS_RE.test(r.name)) {
      skipped.push({
        role: r.name,
        value: "(layer effect)",
        reason: "decorative layer (shadow/scrim/overlay) — not a contrast-bearing foreground",
      });
      return false;
    }
    return true;
  });

  const pairs: ContrastPair[] = [];
  const push = (fg: (typeof resolved)[number], bg: (typeof resolved)[number]) => {
    const kind: "text" | "non-text" = TEXT_RE.test(fg.name) ? "text" : "non-text";
    const required = kind === "text" ? 4.5 : 3.0;
    const bgRgb: [number, number, number] = [bg.c.r, bg.c.g, bg.c.b];
    // Alpha-composite a translucent foreground over its background before measuring.
    const fgRgb = composite(fg.c, bgRgb);
    const ratio = Math.round(contrastRatio(fgRgb, bgRgb) * 100) / 100;
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
