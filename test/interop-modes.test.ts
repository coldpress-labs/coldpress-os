/**
 * Tests for the InteropSet filtering layer (Wave 2.4). Uses the real
 * template .claude/agents/ so we exercise the full writer pipeline.
 */

import { cp, mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  INTEROP_SETS,
  type InteropSet,
  preferredIdesFor,
  runInterop,
} from "../src/interop/index";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const templateAgentsDir = join(repoRoot, "template", ".claude", "agents");

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe("runInterop — interop set filtering", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-interop-set-"));
    await mkdir(join(tmp, ".claude"), { recursive: true });
    await cp(templateAgentsDir, join(tmp, ".claude", "agents"), { recursive: true });
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  async function runAt(set: InteropSet) {
    return runInterop({ targetDir: tmp, respectManagedMarker: false, set });
  }

  it("set='none' emits AGENTS.md only — no IDE-specific outputs", async () => {
    await runAt("none");
    expect(await pathExists(join(tmp, "AGENTS.md"))).toBe(true);
    expect(await pathExists(join(tmp, ".cursor"))).toBe(false);
    expect(await pathExists(join(tmp, ".roomodes"))).toBe(false);
    expect(await pathExists(join(tmp, ".openhands"))).toBe(false);
    expect(await pathExists(join(tmp, ".clinerules"))).toBe(false);
  });

  it("set='claude' emits AGENTS.md only (same surface as none)", async () => {
    await runAt("claude");
    expect(await pathExists(join(tmp, "AGENTS.md"))).toBe(true);
    expect(await pathExists(join(tmp, ".cursor"))).toBe(false);
    expect(await pathExists(join(tmp, ".roomodes"))).toBe(false);
  });

  it("set='cursor' emits AGENTS.md + .cursor/rules (no roomodes, openhands, cline)", async () => {
    await runAt("cursor");
    expect(await pathExists(join(tmp, "AGENTS.md"))).toBe(true);
    expect(await pathExists(join(tmp, ".cursor", "rules"))).toBe(true);
    expect(await pathExists(join(tmp, ".roomodes"))).toBe(false);
    expect(await pathExists(join(tmp, ".openhands"))).toBe(false);
    expect(await pathExists(join(tmp, ".clinerules"))).toBe(false);
  });

  it("set='roo' adds .roomodes on top of cursor", async () => {
    await runAt("roo");
    expect(await pathExists(join(tmp, ".cursor", "rules"))).toBe(true);
    expect(await pathExists(join(tmp, ".roomodes"))).toBe(true);
    expect(await pathExists(join(tmp, ".openhands"))).toBe(false);
    expect(await pathExists(join(tmp, ".clinerules"))).toBe(false);
  });

  it("set='openhands' adds .openhands/microagents on top of roo", async () => {
    await runAt("openhands");
    expect(await pathExists(join(tmp, ".openhands", "microagents"))).toBe(true);
    expect(await pathExists(join(tmp, ".clinerules"))).toBe(false);
  });

  it("set='cline' emits the full set including .clinerules", async () => {
    await runAt("cline");
    expect(await pathExists(join(tmp, ".clinerules"))).toBe(true);
  });

  it("set='all' matches set='cline' (all targets)", async () => {
    await runAt("all");
    expect(await pathExists(join(tmp, "AGENTS.md"))).toBe(true);
    expect(await pathExists(join(tmp, ".cursor", "rules"))).toBe(true);
    expect(await pathExists(join(tmp, ".roomodes"))).toBe(true);
    expect(await pathExists(join(tmp, ".openhands", "microagents"))).toBe(true);
    expect(await pathExists(join(tmp, ".clinerules"))).toBe(true);
  });

  it("default (no set) matches set='all' (no behaviour change for existing callers)", async () => {
    await runInterop({ targetDir: tmp, respectManagedMarker: false });
    expect(await pathExists(join(tmp, ".cursor", "rules"))).toBe(true);
    expect(await pathExists(join(tmp, ".roomodes"))).toBe(true);
    expect(await pathExists(join(tmp, ".openhands", "microagents"))).toBe(true);
    expect(await pathExists(join(tmp, ".clinerules"))).toBe(true);
  });
});

describe("preferredIdesFor", () => {
  it("maps each interop set to the expected IDE identifiers", () => {
    expect(preferredIdesFor("none")).toEqual(["claude-code"]);
    expect(preferredIdesFor("claude")).toEqual(["claude-code"]);
    expect(preferredIdesFor("cursor")).toEqual(["claude-code", "cursor"]);
    expect(preferredIdesFor("roo")).toEqual(["claude-code", "cursor", "roo"]);
    expect(preferredIdesFor("openhands")).toEqual(["claude-code", "cursor", "roo", "openhands"]);
    expect(preferredIdesFor("cline")).toEqual([
      "claude-code",
      "cursor",
      "roo",
      "openhands",
      "cline",
    ]);
    expect(preferredIdesFor("all")).toEqual([
      "claude-code",
      "cursor",
      "roo",
      "openhands",
      "cline",
    ]);
  });
});

describe("INTEROP_SETS", () => {
  it("contains all seven levels in order", () => {
    expect(INTEROP_SETS).toEqual(["none", "claude", "cursor", "roo", "openhands", "cline", "all"]);
  });
});
