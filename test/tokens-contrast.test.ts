/**
 * VP2 O23 — WCAG contrast validation over design tokens.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkTokenContrast, contrastRatio, parseHex, relativeLuminance } from "../src/design/contrast";
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
