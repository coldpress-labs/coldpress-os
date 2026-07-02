/**
 * `visual-verify` — token-conformance check (§5 P8, WS4-D). Delivers the §9
 * acceptance: catches a deliberate token violation (wrong font / off-palette
 * color / 14px-vs-16px spacing).
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkTokenUsage } from "../src/design/visual-verify";
import { TokensSchema } from "../schemas/design/tokens.schema";
import { runVisualVerify } from "../src/commands/visual-verify";

const TOKENS = TokensSchema.parse({
  typography: { families: { sans: "Inter, system-ui" }, sizes: { sm: "14px", base: "16px" } },
  color: { roles: { primary: { light: "#3b82f6" }, text: { light: "#111827" } } },
  spacing: { 1: 4, 2: 8 },
});

describe("checkTokenUsage — catches deliberate token violations", () => {
  it("passes when every used value is a token", () => {
    expect(
      checkTokenUsage({ colors: ["#3b82f6"], fontFamilies: ["Inter, system-ui"], fontSizes: ["16px"], spacings: ["4px"] }, TOKENS),
    ).toEqual([]);
  });

  it("flags an off-palette color", () => {
    const v = checkTokenUsage({ colors: ["#ff00ff"] }, TOKENS);
    expect(v).toHaveLength(1);
    expect(v[0]?.kind).toBe("color");
  });

  it("flags a font size not in the scale (13px, not 14/16)", () => {
    const v = checkTokenUsage({ fontSizes: ["13px"] }, TOKENS);
    expect(v[0]?.kind).toBe("font-size");
  });

  it("flags a non-token font family and an off-scale spacing", () => {
    const v = checkTokenUsage({ fontFamilies: ["Comic Sans MS"], spacings: ["5px"] }, TOKENS);
    expect(v.map((x) => x.kind).sort()).toEqual(["font-family", "spacing"]);
  });

  it("accepts numeric spacing that matches a token (4 → 4px)", () => {
    expect(checkTokenUsage({ spacings: [4, 8] }, TOKENS)).toEqual([]);
  });
});

describe("runVisualVerify", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-vv-"));
    mkdirSync(join(dir, "_context/design"), { recursive: true });
    writeFileSync(
      join(dir, "_context/design/tokens.json"),
      JSON.stringify({ typography: { families: { sans: "Inter" }, sizes: { base: "16px" } }, color: { roles: { primary: { light: "#3b82f6" } } }, spacing: { 1: 4 } }),
      "utf8",
    );
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function writeUsed(obj: unknown): void {
    writeFileSync(join(dir, "_context/design/used-styles.json"), JSON.stringify(obj), "utf8");
  }

  it("exits 1 when used-styles.json is missing", () => {
    expect(runVisualVerify({ projectDir: dir, stderr: () => {} })).toBe(1);
  });

  it("exits 0 when all used styles are tokens", () => {
    writeUsed({ colors: ["#3b82f6"], fontSizes: ["16px"] });
    expect(runVisualVerify({ projectDir: dir, stdout: () => {} })).toBe(0);
  });

  it("exits 1 and reports the violation on an off-palette color", () => {
    writeUsed({ colors: ["#abcdef"] });
    let err = "";
    expect(runVisualVerify({ projectDir: dir, stderr: (s) => (err += s) })).toBe(1);
    expect(err).toContain("off-palette");
  });
});
