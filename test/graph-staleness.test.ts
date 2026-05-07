import { mkdir, mkdtemp, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkGraphStaleness } from "../src/graph/staleness";

describe("checkGraphStaleness", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-staleness-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  async function setupInput(files: { path: string; mtime?: Date }[]): Promise<void> {
    for (const f of files) {
      const full = join(tmp, f.path);
      await mkdir(join(full, ".."), { recursive: true });
      await writeFile(full, "content", "utf8");
      if (f.mtime) {
        await utimes(full, f.mtime, f.mtime);
      }
    }
  }

  async function setupGraph(mtime?: Date): Promise<void> {
    const graphDir = join(tmp, ".coldpress", "graph");
    await mkdir(graphDir, { recursive: true });
    const graphFile = join(graphDir, "graph.json");
    await writeFile(graphFile, "{}", "utf8");
    if (mtime) {
      await utimes(graphFile, mtime, mtime);
    }
  }

  it("returns no-graph when the graph file is missing", async () => {
    await setupInput([{ path: "_input/raw/brief.md" }]);
    const result = await checkGraphStaleness({ projectRoot: tmp });
    expect(result.reason).toBe("no-graph");
    expect(result.stale).toBe(true);
    expect(result.graphBuildTime).toBe(null);
  });

  it("returns no-input when _input/ is missing", async () => {
    await setupGraph();
    const result = await checkGraphStaleness({ projectRoot: tmp });
    expect(result.reason).toBe("no-input");
    expect(result.stale).toBe(false);
    expect(result.latestInputMtime).toBe(null);
  });

  it("returns no-input when _input/ exists but is empty", async () => {
    await mkdir(join(tmp, "_input"), { recursive: true });
    await setupGraph();
    const result = await checkGraphStaleness({ projectRoot: tmp });
    expect(result.reason).toBe("no-input");
    expect(result.stale).toBe(false);
  });

  it("returns fresh when the graph is newer than all input files", async () => {
    const old = new Date("2026-04-20T00:00:00Z");
    const recent = new Date("2026-04-24T00:00:00Z");
    await setupInput([
      { path: "_input/raw/brief.md", mtime: old },
      { path: "_input/reference/article.md", mtime: old },
    ]);
    await setupGraph(recent);

    const result = await checkGraphStaleness({ projectRoot: tmp });
    expect(result.reason).toBe("fresh");
    expect(result.stale).toBe(false);
    expect(result.newerInputFiles).toEqual([]);
    expect(result.graphBuildTime?.getTime()).toBe(recent.getTime());
    expect(result.latestInputMtime?.getTime()).toBe(old.getTime());
  });

  it("returns stale and lists newer files when input mtime > graph mtime", async () => {
    const graphTime = new Date("2026-04-20T00:00:00Z");
    const newerTime = new Date("2026-04-24T00:00:00Z");
    await setupInput([
      { path: "_input/raw/brief.md", mtime: newerTime },
      { path: "_input/reference/old-article.md", mtime: new Date("2026-04-18T00:00:00Z") },
    ]);
    await setupGraph(graphTime);

    const result = await checkGraphStaleness({ projectRoot: tmp });
    expect(result.reason).toBe("stale");
    expect(result.stale).toBe(true);
    expect(result.newerInputFiles.length).toBe(1);
    expect(result.newerInputFiles[0]).toMatch(/brief\.md$/);
  });

  it("skips hidden files (dotfiles) under _input/", async () => {
    const graphTime = new Date("2026-04-20T00:00:00Z");
    const newerTime = new Date("2026-04-24T00:00:00Z");
    await setupInput([{ path: "_input/raw/.DS_Store", mtime: newerTime }]);
    await setupGraph(graphTime);

    const result = await checkGraphStaleness({ projectRoot: tmp });
    expect(result.reason).toBe("no-input");
    expect(result.stale).toBe(false);
  });

  it("walks nested subfolders and picks the latest mtime across all files", async () => {
    const oldTime = new Date("2026-04-18T00:00:00Z");
    const midTime = new Date("2026-04-22T00:00:00Z");
    const newerTime = new Date("2026-04-24T00:00:00Z");
    const graphTime = new Date("2026-04-20T00:00:00Z");

    await setupInput([
      { path: "_input/raw/brief.md", mtime: oldTime },
      { path: "_input/reference/sub/deep.md", mtime: newerTime },
      { path: "_input/vendor/sdk/notes.md", mtime: midTime },
    ]);
    await setupGraph(graphTime);

    const result = await checkGraphStaleness({ projectRoot: tmp });
    expect(result.stale).toBe(true);
    expect(result.latestInputMtime?.getTime()).toBe(newerTime.getTime());
    expect(result.newerInputFiles.length).toBe(2);
    expect(result.newerInputFiles[0]).toMatch(/deep\.md$/);
  });

  it("caps newerInputFiles at 10 entries", async () => {
    const graphTime = new Date("2026-04-20T00:00:00Z");
    const newerTime = new Date("2026-04-24T00:00:00Z");
    const files = Array.from({ length: 15 }, (_, i) => ({
      path: `_input/raw/doc-${i}.md`,
      mtime: newerTime,
    }));
    await setupInput(files);
    await setupGraph(graphTime);

    const result = await checkGraphStaleness({ projectRoot: tmp });
    expect(result.stale).toBe(true);
    expect(result.newerInputFiles.length).toBe(10);
  });
});
