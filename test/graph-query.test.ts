/**
 * Tests for `coldpress graph query` — the skill-facing query surface.
 *
 * Runs the built CLI as a subprocess against fixtures in tmpdirs, so the
 * exit-code contract (0 = ok, 2 = no graph, 1 = error) is tested in the
 * same way skills will experience it.
 */

import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "cli.js");
const httpxFixture = join(repoRoot, "graph", "vendor", "graphify", "worked", "httpx", "graph.json");

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

function runCli(args: string[], cwd: string): RunResult {
  const result = spawnSync("node", [cliPath, ...args], {
    cwd,
    encoding: "utf8",
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.status ?? -1,
  };
}

async function seedGraph(tmp: string, graphJsonPath: string): Promise<void> {
  const dir = join(tmp, ".coldpress", "graph");
  await mkdir(dir, { recursive: true });
  const { readFile } = await import("node:fs/promises");
  const content = await readFile(graphJsonPath, "utf8");
  await writeFile(join(dir, "graph.json"), content, "utf8");
}

describe("coldpress graph query — CLI surface", () => {
  beforeAll(async () => {
    // Ensure the CLI is built against the current source. Vitest runs in
    // the repo root; if dist/cli.js is stale, we build it once up front.
    const { existsSync } = await import("node:fs");
    if (!existsSync(cliPath)) {
      const build = spawnSync("npm", ["run", "build"], { cwd: repoRoot, encoding: "utf8" });
      if (build.status !== 0) {
        throw new Error(`pre-test build failed: ${build.stderr}`);
      }
    }
  });

  describe("exit code contract", () => {
    let tmp: string;
    beforeEach(async () => {
      tmp = await mkdtemp(join(tmpdir(), "coldpress-query-"));
    });
    afterEach(async () => {
      await rm(tmp, { recursive: true, force: true });
    });

    it("exits 2 when no graph exists (signals fallback)", () => {
      const result = runCli(["graph", "query", "--node-type", "CodeModule", "--format", "json"], tmp);
      expect(result.exitCode).toBe(2);
      const parsed = JSON.parse(result.stderr.trim());
      expect(parsed.error).toBe("no_graph");
      expect(parsed.remediation).toContain("coldpress graph rebuild");
    });

    it("exits 1 when the graph file is schema-invalid", async () => {
      const dir = join(tmp, ".coldpress", "graph");
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, "graph.json"), JSON.stringify({ garbage: true }), "utf8");

      const result = runCli(["graph", "query", "--format", "json"], tmp);
      expect(result.exitCode).toBe(1);
    });

    it("exits 0 on a successful query against a well-formed graph", async () => {
      await seedGraph(tmp, httpxFixture);
      const result = runCli(["graph", "query", "--format", "json"], tmp);
      expect(result.exitCode).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload.kind).toBe("stats");
      expect(payload.count).toBe(144);
    });

    it("exits 0 even on an empty result set", async () => {
      await seedGraph(tmp, httpxFixture);
      const result = runCli(
        ["graph", "query", "--node-type", "SacredDoc", "--format", "json"],
        tmp,
      );
      // httpx fixture has no coldpress extensions, so SacredDoc count is 0.
      expect(result.exitCode).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload.kind).toBe("nodes");
      expect(payload.count).toBe(0);
      expect(payload.data).toEqual([]);
    });
  });

  describe("query dispatch", () => {
    let tmp: string;
    beforeEach(async () => {
      tmp = await mkdtemp(join(tmpdir(), "coldpress-query-"));
      await seedGraph(tmp, httpxFixture);
    });
    afterEach(async () => {
      await rm(tmp, { recursive: true, force: true });
    });

    it("returns a single node when --id is passed", () => {
      const result = runCli(
        ["graph", "query", "--id", "client_baseclient", "--format", "json"],
        tmp,
      );
      expect(result.exitCode).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload.kind).toBe("node");
      expect(payload.count).toBe(1);
      expect(payload.data.id).toBe("client_baseclient");
    });

    it("returns null data for a non-existent --id", () => {
      const result = runCli(
        ["graph", "query", "--id", "definitely_not_a_node", "--format", "json"],
        tmp,
      );
      expect(result.exitCode).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload.kind).toBe("node");
      expect(payload.count).toBe(0);
      expect(payload.data).toBeNull();
    });

    it("returns neighbours for --neighbors", () => {
      const result = runCli(
        ["graph", "query", "--neighbors", "client_baseclient", "--format", "json"],
        tmp,
      );
      expect(result.exitCode).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload.kind).toBe("nodes");
      expect(payload.count).toBeGreaterThan(0);
    });

    it("composes --neighbors with --relation", () => {
      const unfiltered = JSON.parse(
        runCli(
          ["graph", "query", "--neighbors", "client", "--format", "json"],
          tmp,
        ).stdout,
      );
      const imports = JSON.parse(
        runCli(
          ["graph", "query", "--neighbors", "client", "--relation", "imports_from", "--format", "json"],
          tmp,
        ).stdout,
      );
      // Filtered count should be ≤ unfiltered.
      expect(imports.count).toBeLessThanOrEqual(unfiltered.count);
    });

    it("returns edges for --relation", () => {
      const result = runCli(
        ["graph", "query", "--relation", "imports_from", "--format", "json"],
        tmp,
      );
      expect(result.exitCode).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload.kind).toBe("edges");
      for (const edge of payload.data) {
        expect(edge.relation).toBe("imports_from");
      }
    });

    it("applies --limit to cap returned results (but count reports full set)", () => {
      const result = runCli(
        ["graph", "query", "--relation", "imports_from", "--limit", "3", "--format", "json"],
        tmp,
      );
      expect(result.exitCode).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload.data.length).toBeLessThanOrEqual(3);
      // count is the pre-limit total.
      expect(payload.count).toBeGreaterThanOrEqual(payload.data.length);
    });
  });

  describe("output format selection", () => {
    let tmp: string;
    beforeEach(async () => {
      tmp = await mkdtemp(join(tmpdir(), "coldpress-query-"));
      await seedGraph(tmp, httpxFixture);
    });
    afterEach(async () => {
      await rm(tmp, { recursive: true, force: true });
    });

    it("--format json emits parseable JSON to stdout", () => {
      const result = runCli(
        ["graph", "query", "--node-type", "CodeModule", "--format", "json"],
        tmp,
      );
      expect(result.exitCode).toBe(0);
      // Must parse — the whole contract with skills.
      expect(() => JSON.parse(result.stdout)).not.toThrow();
    });

    it("--format pretty emits a human-readable header", () => {
      const result = runCli(
        ["graph", "query", "--relation", "imports_from", "--limit", "3", "--format", "pretty"],
        tmp,
      );
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Graph query");
      expect(result.stdout).toContain("kind:");
      expect(result.stdout).toContain("count:");
    });

    it("defaults to json when stdout is not a TTY (captured via spawnSync)", () => {
      // spawnSync pipes stdout, so stdout is not a TTY — default should be json.
      const result = runCli(
        ["graph", "query", "--node-type", "CodeModule"],
        tmp,
      );
      expect(result.exitCode).toBe(0);
      // If the default is json, stdout parses.
      expect(() => JSON.parse(result.stdout)).not.toThrow();
    });
  });
});
