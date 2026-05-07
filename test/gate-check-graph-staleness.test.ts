/**
 * Unit tests for src/gate/checks/graph-staleness-check.ts (§4.14).
 *
 * Tests the config override path (needs_graph_rebuild: false).
 * Full staleness logic is exercised in test/graph-staleness.test.ts;
 * this tests the config short-circuit.
 */

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { graphStalenessCheck } from "../src/gate/checks/graph-staleness-check";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-graph-stale-"));
  await mkdir(join(workDir, ".coldpress"), { recursive: true });
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe("graphStalenessCheck", () => {
  it("passes immediately when needs_graph_rebuild: false in local-config", async () => {
    await writeFile(
      join(workDir, ".coldpress", "local-config.yaml"),
      "needs_graph_rebuild: false\n",
      "utf8",
    );
    const result = await graphStalenessCheck(workDir, []);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("override");
  });

  it("passes for empty path list (nothing to check stale against)", async () => {
    await writeFile(join(workDir, ".coldpress", "local-config.yaml"), "", "utf8");
    const result = await graphStalenessCheck(workDir, []);
    // Empty path list: no stale files by definition
    expect(result.ok).toBe(true);
  });
});
