/**
 * `coldpress tokens build` — the design-token code binding (§5 P5, WS4-A).
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildCss } from "../src/design/tokens-build";
import { TokensSchema } from "../schemas/design/tokens.schema";
import { runTokensBuild } from "../src/commands/tokens";

const TOKENS = {
  typography: { families: { sans: "Inter, system-ui", mono: "ui-monospace" }, sizes: { base: "1rem", xl: 24 } },
  color: { roles: { primary: { light: "#3b82f6", dark: "#60a5fa" }, text: { light: "#111827" } } },
  spacing: { 1: 4, 2: "0.5rem" },
  radii: { md: 8 },
  motion: { durations: { fast: 150 }, easings: { standard: "cubic-bezier(0.2, 0, 0, 1)" } },
};

describe("TokensSchema", () => {
  it("accepts a well-formed tokens object", () => {
    expect(TokensSchema.parse(TOKENS).color.roles.primary?.light).toBe("#3b82f6");
  });
  it("rejects an unknown top-level key + missing required blocks", () => {
    expect(TokensSchema.safeParse({ ...TOKENS, oops: 1 }).success).toBe(false);
    expect(TokensSchema.safeParse({ color: TOKENS.color, spacing: TOKENS.spacing }).success).toBe(false); // no typography
  });
});

describe("buildCss", () => {
  it("emits CSS custom properties; numbers become px; roles map to --color-*", () => {
    const css = buildCss(TokensSchema.parse(TOKENS));
    expect(css).toContain("--font-sans: Inter, system-ui;");
    expect(css).toContain("--text-xl: 24px;"); // number → px
    expect(css).toContain("--text-base: 1rem;"); // string passthrough
    expect(css).toContain("--color-primary: #3b82f6;");
    expect(css).toContain("--space-1: 4px;");
    expect(css).toContain("--radius-md: 8px;");
  });
  it("emits a prefers-color-scheme: dark override for roles with a dark value", () => {
    const css = buildCss(TokensSchema.parse(TOKENS));
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("--color-primary: #60a5fa;");
    // text has no dark value → not in the dark block
    expect(css.split("prefers-color-scheme")[1]).not.toContain("--color-text");
  });
});

describe("runTokensBuild", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-tokens-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function writeTokens(obj: unknown): void {
    mkdirSync(join(dir, "_context/design"), { recursive: true });
    writeFileSync(join(dir, "_context/design/tokens.json"), JSON.stringify(obj), "utf8");
  }

  it("generates tokens.css from tokens.json", () => {
    writeTokens(TOKENS);
    let out = "";
    expect(runTokensBuild({ projectDir: dir, stdout: (s) => (out += s) })).toBe(0);
    expect(out).toContain("tokens build OK");
    expect(existsSync(join(dir, "_context/design/tokens.css"))).toBe(true);
  });

  it("a token edit propagates into the CSS with no manual code change", () => {
    writeTokens(TOKENS);
    runTokensBuild({ projectDir: dir, stdout: () => {} });
    const before = readFileSync(join(dir, "_context/design/tokens.css"), "utf8");
    expect(before).toContain("--color-primary: #3b82f6;");
    // Edit the token, rebuild — CSS reflects it, no hand-editing.
    writeTokens({ ...TOKENS, color: { roles: { primary: { light: "#ef4444" }, text: { light: "#111827" } } } });
    runTokensBuild({ projectDir: dir, stdout: () => {} });
    const after = readFileSync(join(dir, "_context/design/tokens.css"), "utf8");
    expect(after).toContain("--color-primary: #ef4444;");
    expect(after).not.toContain("#3b82f6");
  });

  it("exits 1 on invalid tokens.json (schema violation)", () => {
    writeTokens({ typography: { families: {} } }); // missing sizes, color, spacing
    expect(runTokensBuild({ projectDir: dir, stderr: () => {} })).toBe(1);
  });
});
