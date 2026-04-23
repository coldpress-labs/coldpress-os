/**
 * §6.4 EventStream tests (Block DD).
 *
 * Covers:
 *   - Zod schema discriminated union (every kind, missing fields,
 *     malformed timestamps, slug invariants)
 *   - makeRunId format + sortability
 *   - EventStreamWriter.open(): fresh + resume
 *   - EventStreamWriter.append(): seq monotonicity, validation, disk shape
 *   - Reader: happy + not-found + malformed-line paths
 *   - listRuns discovery
 *   - assertSeqIntegrity invariant
 *   - renderTimeline: empty, kinds, monochrome vs colour, summary line
 */

import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  CondensationSchema,
  EventSchema,
  GateFailObservationSchema,
  GatePassObservationSchema,
  SkillInvokeActionSchema,
  SkillResultObservationSchema,
  WaveEndActionSchema,
  WaveStartActionSchema,
  makeRunId,
} from "../schemas/event-stream.schema";
import { renderTimeline } from "../src/event-stream/inspect";
import {
  EventStreamNotFoundError,
  EventStreamParseError,
  assertSeqIntegrity,
  listRuns,
  readRun,
} from "../src/event-stream/reader";
import { EventStreamWriter } from "../src/event-stream/writer";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-es-"));
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

const FIXED_NOW = new Date("2026-04-24T15:00:00Z");

describe("makeRunId", () => {
  it("produces a kebab-case slug with timestamp prefix", () => {
    const id = makeRunId(FIXED_NOW);
    expect(id).toMatch(/^run-20260424-150000-[0-9a-f]{6}$/);
  });

  it("sorts lexicographically in chronological order", () => {
    const earlier = makeRunId(new Date("2026-01-01T00:00:00Z"));
    const later = makeRunId(new Date("2026-12-31T23:59:59Z"));
    expect([later, earlier].sort()).toEqual([earlier, later]);
  });
});

describe("Schema — per-kind invariants", () => {
  const base = {
    schema_version: 1 as const,
    seq: 0,
    run_id: "run-1",
    timestamp: FIXED_NOW.toISOString(),
  };

  it("WaveStartAction accepts valid shape", () => {
    expect(
      WaveStartActionSchema.safeParse({
        ...base,
        kind: "wave-start",
        wave_id: "w-1",
        phase: 4,
      }).success,
    ).toBe(true);
  });

  it("WaveEndAction rejects unknown status", () => {
    expect(
      WaveEndActionSchema.safeParse({
        ...base,
        kind: "wave-end",
        wave_id: "w-1",
        phase: 4,
        status: "weird",
      }).success,
    ).toBe(false);
  });

  it("SkillInvokeAction requires skill_id", () => {
    expect(
      SkillInvokeActionSchema.safeParse({
        ...base,
        kind: "skill-invoke",
      }).success,
    ).toBe(false);
  });

  it("SkillResultObservation requires exit_code as integer", () => {
    expect(
      SkillResultObservationSchema.safeParse({
        ...base,
        kind: "skill-result",
        skill_id: "x",
        exit_code: 1.5,
      }).success,
    ).toBe(false);
  });

  it("GatePassObservation + GateFailObservation round-trip", () => {
    expect(
      GatePassObservationSchema.safeParse({
        ...base,
        kind: "gate-pass",
        gate_id: "phase-4-exit",
        phase: 4,
      }).success,
    ).toBe(true);
    expect(
      GateFailObservationSchema.safeParse({
        ...base,
        kind: "gate-fail",
        gate_id: "phase-4-exit",
        phase: 4,
        blockers: ["x"],
      }).success,
    ).toBe(true);
  });

  it("Condensation requires summary + seq range", () => {
    expect(
      CondensationSchema.safeParse({
        ...base,
        kind: "condensation",
        wave_id: "w-1",
        summary: "",
        from_seq: 0,
        to_seq: 5,
      }).success,
    ).toBe(false);
    expect(
      CondensationSchema.safeParse({
        ...base,
        kind: "condensation",
        wave_id: "w-1",
        summary: "ok",
        from_seq: 0,
        to_seq: 5,
      }).success,
    ).toBe(true);
  });

  it("EventSchema rejects run_id that isn't a slug", () => {
    expect(
      EventSchema.safeParse({
        ...base,
        run_id: "Run_1!",
        kind: "wave-start",
        wave_id: "w-1",
        phase: 4,
      }).success,
    ).toBe(false);
  });

  it("EventSchema rejects phase outside 1..9", () => {
    expect(
      EventSchema.safeParse({
        ...base,
        kind: "wave-start",
        wave_id: "w-1",
        phase: 10,
      }).success,
    ).toBe(false);
  });

  it("EventSchema rejects malformed timestamp", () => {
    expect(
      EventSchema.safeParse({
        ...base,
        timestamp: "yesterday",
        kind: "wave-start",
        wave_id: "w-1",
        phase: 4,
      }).success,
    ).toBe(false);
  });
});

describe("EventStreamWriter", () => {
  it("opens a fresh run and writes events with seq starting at 0", async () => {
    const w = await EventStreamWriter.open(workDir, {
      runId: "run-test-001",
      now: () => FIXED_NOW,
    });
    try {
      const e = await w.append({
        kind: "wave-start",
        wave_id: "w-1",
        phase: 1,
      });
      expect(e.seq).toBe(0);
      expect(e.run_id).toBe("run-test-001");
      expect(e.timestamp).toBe(FIXED_NOW.toISOString());
    } finally {
      await w.close();
    }

    const written = await readFile(
      join(workDir, ".coldpress/runs/run-test-001/events.jsonl"),
      "utf8",
    );
    expect(written.split("\n").filter(Boolean)).toHaveLength(1);
  });

  it("increments seq monotonically across appends", async () => {
    const w = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    const e1 = await w.append({ kind: "wave-start", wave_id: "w-1", phase: 1 });
    const e2 = await w.append({ kind: "skill-invoke", skill_id: "s1" });
    const e3 = await w.append({
      kind: "skill-result",
      skill_id: "s1",
      cause_seq: e2.seq,
      exit_code: 0,
    });
    await w.close();
    expect([e1.seq, e2.seq, e3.seq]).toEqual([0, 1, 2]);
  });

  it("resumes seq from an existing file on re-open", async () => {
    const first = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    await first.append({ kind: "wave-start", wave_id: "w-1", phase: 1 });
    await first.append({ kind: "skill-invoke", skill_id: "s1" });
    await first.close();

    const second = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    expect(second.nextSeq).toBe(2);
    const next = await second.append({ kind: "skill-invoke", skill_id: "s2" });
    expect(next.seq).toBe(2);
    await second.close();
  });

  it("refuses to write malformed events", async () => {
    const w = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    await expect(
      w.append({
        kind: "wave-start",
        wave_id: "w-1",
        // Zod guards 1..9 at runtime even though the TS type narrows
        // only to `number`; use a cast to test the runtime validator.
        phase: 99 as 1,
      }),
    ).rejects.toThrow(/refusing to append malformed event/);
    await w.close();
  });

  it("close() is idempotent", async () => {
    const w = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    await w.close();
    await w.close();
    await expect(
      w.append({ kind: "wave-start", wave_id: "w-1", phase: 1 }),
    ).rejects.toThrow(/closed/);
  });
});

describe("readRun", () => {
  it("returns events in seq order", async () => {
    const w = await EventStreamWriter.open(workDir, { runId: "r1", now: () => FIXED_NOW });
    await w.append({ kind: "wave-start", wave_id: "w-1", phase: 1 });
    await w.append({ kind: "wave-end", wave_id: "w-1", phase: 1, status: "success" });
    await w.close();

    const events = await readRun("r1", { projectDir: workDir });
    expect(events.map((e) => e.seq)).toEqual([0, 1]);
    expect(events.map((e) => e.kind)).toEqual(["wave-start", "wave-end"]);
  });

  it("throws EventStreamNotFoundError when the run doesn't exist", async () => {
    await expect(readRun("missing", { projectDir: workDir })).rejects.toBeInstanceOf(
      EventStreamNotFoundError,
    );
  });

  it("throws EventStreamParseError on invalid JSON", async () => {
    const runDir = join(workDir, ".coldpress/runs/broken");
    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, "events.jsonl"), "{not valid json\n", "utf8");
    await expect(readRun("broken", { projectDir: workDir })).rejects.toBeInstanceOf(
      EventStreamParseError,
    );
  });

  it("throws EventStreamParseError on schema-invalid event", async () => {
    const runDir = join(workDir, ".coldpress/runs/schema-bad");
    await mkdir(runDir, { recursive: true });
    await writeFile(
      join(runDir, "events.jsonl"),
      JSON.stringify({
        schema_version: 1,
        seq: 0,
        run_id: "r",
        timestamp: "yesterday",
        kind: "wave-start",
        wave_id: "w",
        phase: 99,
      }) + "\n",
      "utf8",
    );
    await expect(
      readRun("schema-bad", { projectDir: workDir }),
    ).rejects.toBeInstanceOf(EventStreamParseError);
  });

  it("tolerates blank lines", async () => {
    const runDir = join(workDir, ".coldpress/runs/blanks");
    await mkdir(runDir, { recursive: true });
    const one = {
      schema_version: 1,
      seq: 0,
      run_id: "r",
      timestamp: FIXED_NOW.toISOString(),
      kind: "wave-start",
      wave_id: "w-1",
      phase: 1,
    };
    await writeFile(
      join(runDir, "events.jsonl"),
      `\n${JSON.stringify(one)}\n\n`,
      "utf8",
    );
    const events = await readRun("blanks", { projectDir: workDir });
    expect(events).toHaveLength(1);
  });
});

describe("listRuns", () => {
  it("returns [] when .coldpress/runs is absent", async () => {
    expect(await listRuns({ projectDir: workDir })).toEqual([]);
  });

  it("lists runs in lexicographic (chronological) order", async () => {
    await EventStreamWriter.open(workDir, { runId: "run-b", now: () => FIXED_NOW }).then((w) =>
      w.append({ kind: "wave-start", wave_id: "w", phase: 1 }).then(() => w.close()),
    );
    await EventStreamWriter.open(workDir, { runId: "run-a", now: () => FIXED_NOW }).then((w) =>
      w.append({ kind: "wave-start", wave_id: "w", phase: 1 }).then(() => w.close()),
    );
    expect(await listRuns({ projectDir: workDir })).toEqual(["run-a", "run-b"]);
  });
});

describe("assertSeqIntegrity", () => {
  it("passes when seqs are contiguous", () => {
    const events = [
      { seq: 0 },
      { seq: 1 },
      { seq: 2 },
    ] as Parameters<typeof assertSeqIntegrity>[0];
    expect(() => assertSeqIntegrity(events)).not.toThrow();
  });

  it("throws when a seq is skipped", () => {
    const events = [{ seq: 0 }, { seq: 2 }] as Parameters<typeof assertSeqIntegrity>[0];
    expect(() => assertSeqIntegrity(events)).toThrow(/Seq integrity violated/);
  });
});

describe("renderTimeline", () => {
  it("emits (no events) for an empty stream", () => {
    const out = renderTimeline([], { monochrome: true });
    expect(out).toContain("(no events)");
  });

  it("emits one line per event + a summary footer", async () => {
    const w = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    await w.append({ kind: "wave-start", wave_id: "w-1", phase: 1 });
    await w.append({ kind: "skill-invoke", skill_id: "s1" });
    await w.append({
      kind: "skill-result",
      skill_id: "s1",
      cause_seq: 1,
      exit_code: 0,
    });
    await w.append({
      kind: "gate-evaluate",
      gate_id: "phase-1-exit",
      phase: 1,
    });
    await w.append({
      kind: "gate-pass",
      gate_id: "phase-1-exit",
      phase: 1,
      cause_seq: 3,
    });
    await w.append({
      kind: "wave-end",
      wave_id: "w-1",
      phase: 1,
      status: "success",
    });
    await w.close();
    const events = await readRun("r", { projectDir: workDir });

    const out = renderTimeline(events, { monochrome: true });
    expect(out).toContain("▶ WAVE");
    expect(out).toContain("→ skill");
    expect(out).toContain("← skill");
    expect(out).toContain("→ gate");
    expect(out).toContain("✓ gate");
    expect(out).toContain("■ WAVE");
    expect(out).toContain("skills: 1✓ / 0✗");
    expect(out).toContain("gates: 1✓ / 0✗");
  });

  it("fails-loud on gate-fail visually", async () => {
    const w = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    await w.append({
      kind: "gate-fail",
      gate_id: "phase-6-exit",
      phase: 6,
      blockers: ["a", "b", "c"],
    });
    await w.close();
    const events = await readRun("r", { projectDir: workDir });
    const out = renderTimeline(events, { monochrome: true });
    expect(out).toContain("✗ gate");
    expect(out).toContain("3 blockers");
    expect(out).toContain("gates: 0✓ / 1✗");
  });

  it("honours absolute time-style", async () => {
    const w = await EventStreamWriter.open(workDir, { runId: "r", now: () => FIXED_NOW });
    await w.append({ kind: "wave-start", wave_id: "w", phase: 1 });
    await w.close();
    const events = await readRun("r", { projectDir: workDir });
    const out = renderTimeline(events, { monochrome: true, timeStyle: "absolute" });
    expect(out).toContain("2026-04-24T15:00:00");
  });
});
