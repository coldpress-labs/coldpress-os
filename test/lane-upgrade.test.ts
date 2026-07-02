/**
 * `coldpress lane-upgrade` — lite → full without data loss (§6, WS3-C).
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runLaneUpgrade } from "../src/commands/lane-upgrade";
import { StateSchema } from "../schemas/state.schema";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-upgrade-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function seedLite(): void {
  writeFileSync(join(dir, "coldpress.yaml"), "lane: lite\nproject:\n  name: Demo\n  slug: demo\n", "utf8");
  mkdirSync(join(dir, ".coldpress"), { recursive: true });
  writeFileSync(join(dir, ".coldpress/state.yaml"), "lane: lite\nphase: spec\nphase_status: in_progress\nsecurity_tier: T0\nenforcement: on\n", "utf8");
  mkdirSync(join(dir, "_context/sacred"), { recursive: true });
  writeFileSync(join(dir, "_context/sacred/spec.md"), "# Spec\n\nR1: users can log in.\nStack: Astro + Vercel.\n", "utf8");
  writeFileSync(join(dir, "_context/sacred/decisions.md"), "# Decisions\n\n- chose Astro for the static site.\n", "utf8");
}

describe("runLaneUpgrade", () => {
  it("flips the lane, back-fills sacred docs, and preserves lite artifacts (no data loss)", () => {
    seedLite();
    const specBefore = readFileSync(join(dir, "_context/sacred/spec.md"), "utf8");
    const decisionsBefore = readFileSync(join(dir, "_context/sacred/decisions.md"), "utf8");

    let out = "";
    expect(runLaneUpgrade({ projectDir: dir, stdout: (s) => (out += s) })).toBe(0);

    // Lane flipped in both files.
    expect((parseYaml(readFileSync(join(dir, "coldpress.yaml"), "utf8")) as { lane: string }).lane).toBe("full");
    const state = StateSchema.parse(parseYaml(readFileSync(join(dir, ".coldpress/state.yaml"), "utf8")));
    expect(state.lane).toBe("full");
    expect(state.phase).toBe(4); // spec → P4

    // Full-lane sacred docs back-filled.
    for (const doc of ["context", "tech-stack", "prd", "architecture"]) {
      expect(existsSync(join(dir, `_context/sacred/${doc}.md`)), doc).toBe(true);
    }

    // NO DATA LOSS — the lite artifacts are byte-for-byte preserved.
    expect(readFileSync(join(dir, "_context/sacred/spec.md"), "utf8")).toBe(specBefore);
    expect(readFileSync(join(dir, "_context/sacred/decisions.md"), "utf8")).toBe(decisionsBefore);
  });

  it("refuses when already on the full lane", () => {
    seedLite();
    writeFileSync(join(dir, "coldpress.yaml"), "lane: full\n", "utf8");
    expect(runLaneUpgrade({ projectDir: dir, stderr: () => {} })).toBe(1);
  });

  it("refuses when there is no spec.md to back-fill from", () => {
    writeFileSync(join(dir, "coldpress.yaml"), "lane: lite\n", "utf8");
    expect(runLaneUpgrade({ projectDir: dir, stderr: () => {} })).toBe(1);
  });

  it("does not clobber an existing sacred doc", () => {
    seedLite();
    writeFileSync(join(dir, "_context/sacred/prd.md"), "# Existing PRD\nkeep me\n", "utf8");
    runLaneUpgrade({ projectDir: dir, stdout: () => {} });
    expect(readFileSync(join(dir, "_context/sacred/prd.md"), "utf8")).toContain("keep me");
  });
});
