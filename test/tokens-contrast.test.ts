/**
 * VP2 O23 — WCAG contrast validation over design tokens.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  checkTokenContrast,
  composite,
  contrastRatio,
  parseColor,
  parseHex,
  relativeLuminance,
} from "../src/design/contrast";
import { runTokensContrast } from "../src/commands/tokens";

describe("WCAG math", () => {
  it("parses #rgb and #rrggbb", () => {
    expect(parseHex("#fff")).toEqual([255, 255, 255]);
    expect(parseHex("000000")).toEqual([0, 0, 0]);
    expect(parseHex("#1a2b3c")).toEqual([26, 43, 60]);
    expect(parseHex("rgb(1,2,3)")).toBeNull();
  });
  it("black on white is 21:1, identical is 1:1", () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrastRatio([120, 120, 120], [120, 120, 120])).toBeCloseTo(1, 5);
  });
  it("relative luminance: white=1, black=0", () => {
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 5);
    expect(relativeLuminance([0, 0, 0])).toBeCloseTo(0, 5);
  });
});

describe("colour parsing beyond hex (VP2 O41)", () => {
  it("parses rgb()/rgba() incl. alpha", () => {
    expect(parseColor("rgb(1, 2, 3)")).toEqual({ r: 1, g: 2, b: 3, a: 1 });
    expect(parseColor("rgba(36, 48, 58, 0.22)")).toEqual({ r: 36, g: 48, b: 58, a: 0.22 });
  });
  it("parses hsl()/hsla()", () => {
    expect(parseColor("hsl(0, 0%, 100%)")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor("hsl(0 0% 0%)")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    const red = parseColor("hsla(0, 100%, 50%, 0.5)");
    expect(red?.r).toBe(255);
    expect(red?.a).toBe(0.5);
  });
  it("parses #rgba / #rrggbbaa alpha hex", () => {
    expect(parseColor("#000f")?.a).toBe(1);
    expect(parseColor("#00000080")?.a).toBeCloseTo(0.5, 1);
  });
  it("composites a translucent foreground over its background", () => {
    // 50% black over white → mid grey
    expect(composite({ r: 0, g: 0, b: 0, a: 0.5 }, [255, 255, 255])).toEqual([128, 128, 128]);
  });
});

describe("layer effects + translucent backgrounds (VP2 O41)", () => {
  it("skips decorative layers (shadow/scrim/overlay) but keeps focus indicators", () => {
    const r = checkTokenContrast(
      tokens({
        bg: "#ffffff",
        "shadow-tint-umbra": "rgba(36,48,58,0.22)",
        "overlay-scrim": "rgba(251,247,240,0.72)",
        "focus-ring-glow": "rgba(178,58,30,0.35)",
      }),
    );
    const checked = r.pairs.map((p) => p.fg);
    expect(checked).toContain("focus-ring-glow"); // focus must still meet 3:1
    expect(checked).not.toContain("shadow-tint-umbra");
    expect(checked).not.toContain("overlay-scrim");
    // and they're reported as skipped-with-reason, not silently dropped
    expect(r.skipped.map((s) => s.role)).toEqual(expect.arrayContaining(["shadow-tint-umbra", "overlay-scrim"]));
  });
  it("refuses a translucent background as a contrast baseline", () => {
    const r = checkTokenContrast(tokens({ "surface-glass": "rgba(255,255,255,0.5)", text: "#111111" }));
    expect(r.backgrounds).not.toContain("surface-glass");
    expect(r.skipped.some((s) => s.role === "surface-glass")).toBe(true);
  });
});

function tokensThemed(roles: Record<string, { light: string; dark?: string }>) {
  return {
    typography: { families: { sans: "Inter" }, sizes: { base: "16px" } },
    color: { roles },
    spacing: { md: "8px" },
  } as never;
}

describe("dual-theme validation (VP2 O41 — dark-default projects were unvalidated)", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-theme-"));
    mkdirSync(join(dir, "_context/design"), { recursive: true });
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));
  const noop = () => {};

  it("fails when the DARK theme breaks contrast even though light passes", () => {
    // light: #111 on #fff (pass) — dark: #333 on #000 (2.2:1, fail)
    writeFileSync(
      join(dir, "_context/design/tokens.json"),
      JSON.stringify(
        tokensThemed({
          bg: { light: "#ffffff", dark: "#000000" },
          "text-body": { light: "#111111", dark: "#333333" },
        }),
      ),
      "utf8",
    );
    expect(runTokensContrast({ projectDir: dir, stdout: noop, stderr: noop })).toBe(1);
  });

  it("checks the dark palette independently of light", () => {
    const r = checkTokenContrast(
      tokensThemed({ bg: { light: "#ffffff", dark: "#000000" }, "text-body": { light: "#111111", dark: "#eeeeee" } }),
      { theme: "dark" },
    );
    expect(r.theme).toBe("dark");
    expect(r.failures).toHaveLength(0);
  });
});

function tokens(roles: Record<string, string>) {
  return {
    typography: { families: { sans: "Inter" }, sizes: { base: "16px" } },
    color: { roles: Object.fromEntries(Object.entries(roles).map(([k, v]) => [k, { light: v }])) },
    spacing: { md: "8px" },
  } as never;
}

describe("checkTokenContrast", () => {
  it("flags a too-light text role and passes a dark one, on the bg", () => {
    const r = checkTokenContrast(
      tokens({ bg: "#ffffff", "text-body": "#111111", "text-faint": "#cccccc", border: "#767676" }),
    );
    expect(r.backgrounds).toContain("bg");
    const body = r.pairs.find((p) => p.fg === "text-body");
    const faint = r.pairs.find((p) => p.fg === "text-faint");
    const border = r.pairs.find((p) => p.fg === "border");
    expect(body?.pass).toBe(true); // #111 on #fff ≫ 4.5
    expect(faint?.pass).toBe(false); // #ccc on #fff < 4.5
    expect(faint?.required).toBe(4.5); // text threshold
    expect(border?.required).toBe(3.0); // non-text threshold (SC 1.4.11)
    expect(r.failures.map((f) => f.fg)).toContain("text-faint");
  });
  it("skips inverse/on-* roles for the general-background sweep", () => {
    const r = checkTokenContrast(tokens({ bg: "#ffffff", "text-inverse": "#ffffff", "text-on-primary": "#fff" }));
    expect(r.pairs.length).toBe(0); // both foregrounds skipped
    expect(r.failures.length).toBe(0);
  });
});

describe("runTokensContrast (gate command)", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-contrast-"));
    mkdirSync(join(dir, "_context/design"), { recursive: true });
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));
  const noop = () => {};

  function writeTokens(roles: Record<string, string>) {
    writeFileSync(join(dir, "_context/design/tokens.json"), JSON.stringify(tokens(roles)), "utf8");
  }

  it("returns 0 when all pairs pass", () => {
    writeTokens({ bg: "#ffffff", "text-body": "#111111", border: "#595959" });
    expect(runTokensContrast({ projectDir: dir, stdout: noop, stderr: noop })).toBe(0);
  });
  it("returns 1 (block) on a failing pair", () => {
    writeTokens({ bg: "#ffffff", "text-faint": "#cccccc" });
    expect(runTokensContrast({ projectDir: dir, stdout: noop, stderr: noop })).toBe(1);
  });
  it("skip-passes (0) for a non-UI project with no tokens.json", () => {
    expect(runTokensContrast({ projectDir: dir, stdout: noop, stderr: noop })).toBe(0);
  });
});
