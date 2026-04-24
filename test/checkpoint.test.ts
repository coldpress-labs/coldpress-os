/**
 * Checkpoint + skill-cache tests (§6.5).
 */

import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  CheckpointSchema,
  InterruptKindEnum,
  SkillCacheEntrySchema,
} from "../schemas/checkpoint.schema";
import { SkillResultCache, hashInputs } from "../src/checkpoint/cache";
import {
  CheckpointDriftError,
  CheckpointNotFoundError,
  CheckpointParseError,
  readCheckpoint,
} from "../src/checkpoint/restore";
import { saveCheckpoint } from "../src/checkpoint/save";
import { EventStreamWriter } from "../src/event-stream/writer";

const FIXED_NOW = new Date("2026-04-24T15:00:00Z");

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-checkpoint-"));
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe("InterruptKindEnum", () => {
  it("covers the 5 canonical kinds", () => {
    for (const k of [
      "phase-boundary",
      "need-info",
      "human-gate",
      "manual",
      "error",
    ]) {
      expect(InterruptKindEnum.safeParse(k).success).toBe(true);
    }
  });

  it("rejects unknown kinds", () => {
    expect(InterruptKindEnum.safeParse("vibes").success).toBe(false);
  });
});

describe("CheckpointSchema", () => {
  const baseline = {
    schema_version: 1 as const,
    run_id: "run-1",
    created_at: FIXED_NOW.toISOString(),
    last_event_seq: 5,
    interrupt_kind: "phase-boundary" as const,
    reason: "phase 4 → 5 boundary",
    state: { phase: 4 },
  };

  it("accepts a well-formed checkpoint", () => {
    expect(CheckpointSchema.safeParse(baseline).success).toBe(true);
  });

  it("rejects non-slug run_id", () => {
    expect(
      CheckpointSchema.safeParse({ ...baseline, run_id: "Run-1!" }).success,
    ).toBe(false);
  });

  it("rejects negative last_event_seq", () => {
    expect(
      CheckpointSchema.safeParse({ ...baseline, last_event_seq: -1 }).success,
    ).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(
      CheckpointSchema.safeParse({ ...baseline, reason: "" }).success,
    ).toBe(false);
  });

  it("accepts arbitrary state shapes", () => {
    expect(
      CheckpointSchema.safeParse({ ...baseline, state: { a: [1, 2], b: { c: "x" } } })
        .success,
    ).toBe(true);
    expect(
      CheckpointSchema.safeParse({ ...baseline, state: null }).success,
    ).toBe(true);
  });
});

describe("saveCheckpoint", () => {
  it("writes a checkpoint at .coldpress/runs/<run-id>/checkpoint.json", async () => {
    const result = await saveCheckpoint({
      projectDir: workDir,
      runId: "run-test",
      lastEventSeq: 0,
      interruptKind: "manual",
      reason: "test save",
      state: { x: 1 },
      now: () => FIXED_NOW,
    });
    expect(result.path.endsWith("/run-test/checkpoint.json")).toBe(true);
    const written = JSON.parse(await readFile(result.path, "utf8"));
    expect(written).toMatchObject({
      schema_version: 1,
      run_id: "run-test",
      interrupt_kind: "manual",
      reason: "test save",
      last_event_seq: 0,
      state: { x: 1 },
    });
  });

  it("overwrites prior checkpoint atomically", async () => {
    await saveCheckpoint({
      projectDir: workDir,
      runId: "r",
      lastEventSeq: 0,
      interruptKind: "manual",
      reason: "first",
      state: { v: 1 },
      now: () => FIXED_NOW,
    });
    await saveCheckpoint({
      projectDir: workDir,
      runId: "r",
      lastEventSeq: 5,
      interruptKind: "phase-boundary",
      reason: "second",
      state: { v: 2 },
      now: () => FIXED_NOW,
    });
    const written = JSON.parse(
      await readFile(join(workDir, ".coldpress/runs/r/checkpoint.json"), "utf8"),
    );
    expect(written.reason).toBe("second");
    expect(written.last_event_seq).toBe(5);
  });
});

describe("readCheckpoint", () => {
  it("throws CheckpointNotFoundError when missing", async () => {
    await expect(
      readCheckpoint({ projectDir: workDir, runId: "missing" }),
    ).rejects.toBeInstanceOf(CheckpointNotFoundError);
  });

  it("throws CheckpointParseError on malformed JSON", async () => {
    const path = join(workDir, ".coldpress/runs/r/checkpoint.json");
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, "{not json", "utf8");
    await expect(
      readCheckpoint({ projectDir: workDir, runId: "r" }),
    ).rejects.toBeInstanceOf(CheckpointParseError);
  });

  it("throws CheckpointParseError on schema violation", async () => {
    const path = join(workDir, ".coldpress/runs/r/checkpoint.json");
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(
      path,
      JSON.stringify({
        schema_version: 1,
        run_id: "Bad ID!",
        created_at: FIXED_NOW.toISOString(),
        last_event_seq: 0,
        interrupt_kind: "manual",
        reason: "x",
        state: null,
      }),
      "utf8",
    );
    await expect(
      readCheckpoint({ projectDir: workDir, runId: "r" }),
    ).rejects.toBeInstanceOf(CheckpointParseError);
  });

  it("succeeds when checkpoint matches EventStream tail (no drift)", async () => {
    const w = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    await w.append({ kind: "wave-start", wave_id: "w-1", phase: 1 });
    await w.append({ kind: "wave-end", wave_id: "w-1", phase: 1, status: "success" });
    await w.close();

    await saveCheckpoint({
      projectDir: workDir,
      runId: "r",
      lastEventSeq: 1,
      interruptKind: "phase-boundary",
      reason: "after wave 1",
      state: { phase: 1 },
      now: () => FIXED_NOW,
    });

    const cp = await readCheckpoint({ projectDir: workDir, runId: "r" });
    expect(cp.last_event_seq).toBe(1);
  });

  it("throws CheckpointDriftError when EventStream has moved past last_event_seq", async () => {
    const w = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    await w.append({ kind: "wave-start", wave_id: "w-1", phase: 1 });
    await w.close();

    await saveCheckpoint({
      projectDir: workDir,
      runId: "r",
      lastEventSeq: 0,
      interruptKind: "manual",
      reason: "checkpoint at start",
      state: null,
      now: () => FIXED_NOW,
    });

    // Append more events AFTER the checkpoint; live stream now drifted.
    const w2 = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    await w2.append({ kind: "wave-end", wave_id: "w-1", phase: 1, status: "success" });
    await w2.append({ kind: "skill-invoke", skill_id: "x" });
    await w2.close();

    await expect(
      readCheckpoint({ projectDir: workDir, runId: "r" }),
    ).rejects.toBeInstanceOf(CheckpointDriftError);
  });

  it("skipDriftCheck bypasses the drift assertion (inspect-only callers)", async () => {
    const w = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    for (let i = 0; i < 5; i++) {
      await w.append({ kind: "wave-start", wave_id: `w-${i}`, phase: 1 });
    }
    await w.close();

    await saveCheckpoint({
      projectDir: workDir,
      runId: "r",
      lastEventSeq: 0,
      interruptKind: "manual",
      reason: "stale",
      state: null,
      now: () => FIXED_NOW,
    });

    const cp = await readCheckpoint({
      projectDir: workDir,
      runId: "r",
      skipDriftCheck: true,
    });
    expect(cp.reason).toBe("stale");
  });
});

describe("hashInputs", () => {
  it("produces the same hash for keys in different orders", () => {
    const h1 = hashInputs({
      skillId: "s",
      versionMarker: "v1",
      args: { a: 1, b: 2 },
    });
    const h2 = hashInputs({
      skillId: "s",
      versionMarker: "v1",
      args: { b: 2, a: 1 },
    });
    expect(h1).toBe(h2);
  });

  it("produces different hashes for different version_markers", () => {
    const h1 = hashInputs({ skillId: "s", versionMarker: "v1", args: {} });
    const h2 = hashInputs({ skillId: "s", versionMarker: "v2", args: {} });
    expect(h1).not.toBe(h2);
  });

  it("produces different hashes for different skill_ids", () => {
    const h1 = hashInputs({ skillId: "a", versionMarker: "v1", args: {} });
    const h2 = hashInputs({ skillId: "b", versionMarker: "v1", args: {} });
    expect(h1).not.toBe(h2);
  });

  it("produces different hashes for different args", () => {
    const h1 = hashInputs({ skillId: "s", versionMarker: "v1", args: { x: 1 } });
    const h2 = hashInputs({ skillId: "s", versionMarker: "v1", args: { x: 2 } });
    expect(h1).not.toBe(h2);
  });

  it("hash is 64 hex chars (SHA-256)", () => {
    expect(
      hashInputs({ skillId: "s", versionMarker: "v1", args: {} }),
    ).toMatch(/^[0-9a-f]{64}$/);
  });

  it("rejects non-finite numbers in args", () => {
    expect(() =>
      hashInputs({ skillId: "s", versionMarker: "v1", args: { n: NaN } }),
    ).toThrow(/non-finite/);
    expect(() =>
      hashInputs({ skillId: "s", versionMarker: "v1", args: { n: Infinity } }),
    ).toThrow(/non-finite/);
  });
});

describe("SkillResultCache", () => {
  it("returns null for unseen hash", async () => {
    const cache = new SkillResultCache(workDir);
    expect(await cache.get("deadbeef")).toBeNull();
  });

  it("put + get round-trip preserves the entry", async () => {
    const cache = new SkillResultCache(workDir);
    const hash = hashInputs({
      skillId: "create-prd",
      versionMarker: "v1",
      args: { project: "demo" },
    });
    const stored = await cache.put({
      hash,
      skillId: "create-prd",
      versionMarker: "v1",
      inputs: { project: "demo" },
      result: { exit_code: 0, artifact_path: "_context/sacred/prd.md" },
      cachedAt: FIXED_NOW,
    });
    const fetched = await cache.get(hash);
    expect(fetched).toEqual(stored);
    expect(fetched?.skill_id).toBe("create-prd");
  });

  it("validates cached entries; treats schema-invalid disk file as miss", async () => {
    const cache = new SkillResultCache(workDir);
    const hash = "deadbeef";
    const path = join(workDir, ".coldpress/cache/skill-results", `${hash}.json`);
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, JSON.stringify({ schema_version: 99 }), "utf8");
    expect(await cache.get(hash)).toBeNull();
  });

  it("put refuses to write malformed entry", async () => {
    const cache = new SkillResultCache(workDir);
    await expect(
      cache.put({
        hash: "x",
        skillId: "",
        versionMarker: "v1",
        inputs: {},
        result: { exit_code: 0 },
      }),
    ).rejects.toThrow();
  });

  it("SkillCacheEntrySchema accepts a minimal entry", () => {
    expect(
      SkillCacheEntrySchema.safeParse({
        schema_version: 1,
        hash: "h",
        skill_id: "s",
        version_marker: "v1",
        cached_at: FIXED_NOW.toISOString(),
        result: { exit_code: 0 },
        inputs: {},
      }).success,
    ).toBe(true);
  });
});
