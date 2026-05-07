/**
 * Unit tests for src/gate/checks/validate-pack-match.ts (§4.14).
 */

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validatePackMatch } from "../src/gate/checks/validate-pack-match";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-pack-match-"));
  await mkdir(join(workDir, "_context", "planning"), { recursive: true });
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function writeShortlist(packMatch: Record<string, unknown>): Promise<void> {
  const fm = `name: "stack-shortlist"
phase_authored: 3
status: final
version: "1.0"
derived_from: []
decision_areas:
  - area: database
    candidates: ["Convex"]
    rationale: test
pack_match:
${Object.entries(packMatch).map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`).join("\n")}`;
  await writeFile(
    join(workDir, "_context", "planning", "stack-shortlist-v1.md"),
    `---\n${fm}\n---\n`,
    "utf8",
  );
}

describe("validatePackMatch", () => {
  it("passes when matched_pack_name is set", async () => {
    await writeShortlist({ matched_pack_name: "nextjs-convex", user_confirmed: true });
    const result = await validatePackMatch(workDir);
    expect(result.ok).toBe(true);
    expect(result.matched_pack).toBe("nextjs-convex");
  });

  it("passes when no-match explicitly confirmed (null + user_confirmed: true)", async () => {
    await writeShortlist({ matched_pack_name: null, user_confirmed: true });
    const result = await validatePackMatch(workDir);
    expect(result.ok).toBe(true);
    expect(result.matched_pack).toBeNull();
  });

  it("fails when no-match not confirmed (null + user_confirmed: false)", async () => {
    await writeShortlist({ matched_pack_name: null, user_confirmed: false });
    const result = await validatePackMatch(workDir);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("user_confirmed");
  });

  it("fails when no shortlist file exists", async () => {
    const result = await validatePackMatch(workDir);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("No stack-shortlist");
  });

  it("fails when pack_match section is missing", async () => {
    await writeFile(
      join(workDir, "_context", "planning", "stack-shortlist-v1.md"),
      `---\nname: "stack-shortlist"\nphase_authored: 3\nstatus: final\nversion: "1.0"\nderived_from: []\ndecision_areas:\n  - area: db\n    candidates: []\n    rationale: test\n---\n`,
      "utf8",
    );
    const result = await validatePackMatch(workDir);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("pack_match section missing");
  });
});
