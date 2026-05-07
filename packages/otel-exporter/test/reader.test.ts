import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  EventStreamNotFoundError,
  EventStreamParseError,
  listRuns,
  readRun,
} from "../src/reader.js";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "otel-exporter-reader-"));
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function seedRun(runId: string, lines: object[]): Promise<void> {
  const dir = join(workDir, ".coldpress/runs", runId);
  await mkdir(dir, { recursive: true });
  const content = lines.map((l) => JSON.stringify(l)).join("\n") + "\n";
  await writeFile(join(dir, "events.jsonl"), content, "utf8");
}

describe("readRun", () => {
  it("returns parsed events in seq order for a valid stream", async () => {
    const runId = "run-20260424-120000-abcdef";
    await seedRun(runId, [
      {
        schema_version: 1,
        seq: 0,
        run_id: runId,
        timestamp: "2026-04-24T12:00:00.000Z",
        kind: "wave-start",
        wave_id: "w1",
        phase: 4,
      },
      {
        schema_version: 1,
        seq: 1,
        run_id: runId,
        timestamp: "2026-04-24T12:00:01.000Z",
        kind: "wave-end",
        wave_id: "w1",
        phase: 4,
        status: "success",
      },
    ]);
    const events = await readRun(runId, { projectDir: workDir });
    expect(events).toHaveLength(2);
    expect(events[0]!.kind).toBe("wave-start");
    expect(events[1]!.kind).toBe("wave-end");
  });

  it("tolerates blank lines", async () => {
    const runId = "run-20260424-120001-abcdef";
    const dir = join(workDir, ".coldpress/runs", runId);
    await mkdir(dir, { recursive: true });
    const line = JSON.stringify({
      schema_version: 1,
      seq: 0,
      run_id: runId,
      timestamp: "2026-04-24T12:00:00.000Z",
      kind: "wave-start",
      wave_id: "w1",
      phase: 1,
    });
    await writeFile(join(dir, "events.jsonl"), `\n${line}\n\n`, "utf8");
    const events = await readRun(runId, { projectDir: workDir });
    expect(events).toHaveLength(1);
  });

  it("throws EventStreamNotFoundError when the run doesn't exist", async () => {
    await expect(
      readRun("run-missing", { projectDir: workDir }),
    ).rejects.toBeInstanceOf(EventStreamNotFoundError);
  });

  it("throws EventStreamParseError on malformed JSON", async () => {
    const runId = "run-20260424-120002-abcdef";
    const dir = join(workDir, ".coldpress/runs", runId);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "events.jsonl"), "{not-json\n", "utf8");
    await expect(
      readRun(runId, { projectDir: workDir }),
    ).rejects.toBeInstanceOf(EventStreamParseError);
  });

  it("throws EventStreamParseError on schema-violating events", async () => {
    const runId = "run-20260424-120003-abcdef";
    await seedRun(runId, [
      {
        schema_version: 1,
        seq: 0,
        run_id: runId,
        timestamp: "2026-04-24T12:00:00.000Z",
        kind: "wave-start",
        wave_id: "w1",
        phase: 99, // out of range
      },
    ]);
    await expect(
      readRun(runId, { projectDir: workDir }),
    ).rejects.toBeInstanceOf(EventStreamParseError);
  });
});

describe("listRuns", () => {
  it("returns [] when .coldpress/runs is absent", async () => {
    const ids = await listRuns({ projectDir: workDir });
    expect(ids).toEqual([]);
  });

  it("returns run ids sorted chronologically", async () => {
    await seedRun("run-20260424-120002-zzzzzz", [
      {
        schema_version: 1,
        seq: 0,
        run_id: "run-20260424-120002-zzzzzz",
        timestamp: "2026-04-24T12:00:02.000Z",
        kind: "wave-start",
        wave_id: "w",
        phase: 1,
      },
    ]);
    await seedRun("run-20260424-120001-aaaaaa", [
      {
        schema_version: 1,
        seq: 0,
        run_id: "run-20260424-120001-aaaaaa",
        timestamp: "2026-04-24T12:00:01.000Z",
        kind: "wave-start",
        wave_id: "w",
        phase: 1,
      },
    ]);
    const ids = await listRuns({ projectDir: workDir });
    expect(ids).toEqual([
      "run-20260424-120001-aaaaaa",
      "run-20260424-120002-zzzzzz",
    ]);
  });
});
