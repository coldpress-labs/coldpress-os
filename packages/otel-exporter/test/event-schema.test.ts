import { describe, expect, it } from "vitest";
import { EventSchema } from "../src/event-schema.js";

const BASE = {
  schema_version: 1 as const,
  seq: 0,
  run_id: "run-20260424-120000-abcdef",
  timestamp: "2026-04-24T12:00:00.000Z",
};

describe("EventSchema — accepts every documented kind", () => {
  it.each([
    ["wave-start", { ...BASE, kind: "wave-start", wave_id: "wave-1", phase: 4 }],
    [
      "wave-end",
      { ...BASE, kind: "wave-end", wave_id: "wave-1", phase: 4, status: "success" },
    ],
    [
      "skill-invoke",
      { ...BASE, kind: "skill-invoke", skill_id: "create-prd", caller: "pm" },
    ],
    [
      "skill-result",
      {
        ...BASE,
        kind: "skill-result",
        skill_id: "create-prd",
        cause_seq: 0,
        exit_code: 0,
      },
    ],
    [
      "gate-evaluate",
      { ...BASE, kind: "gate-evaluate", gate_id: "phase-4-exit", phase: 4 },
    ],
    [
      "gate-pass",
      { ...BASE, kind: "gate-pass", gate_id: "phase-4-exit", phase: 4 },
    ],
    [
      "gate-fail",
      {
        ...BASE,
        kind: "gate-fail",
        gate_id: "phase-4-exit",
        phase: 4,
        blockers: ["missing approver"],
      },
    ],
    [
      "condensation",
      {
        ...BASE,
        kind: "condensation",
        wave_id: "wave-1",
        summary: "wave 1 summary",
        from_seq: 0,
        to_seq: 4,
      },
    ],
  ])("parses %s", (_kind, event) => {
    const r = EventSchema.safeParse(event);
    expect(r.success).toBe(true);
  });
});

describe("EventSchema — fail-loud rejections", () => {
  it("rejects schema_version !== 1", () => {
    const r = EventSchema.safeParse({
      ...BASE,
      schema_version: 2,
      kind: "wave-start",
      wave_id: "w",
      phase: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects phase outside 1..9", () => {
    const r = EventSchema.safeParse({
      ...BASE,
      kind: "wave-start",
      wave_id: "w",
      phase: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-slug run_id", () => {
    const r = EventSchema.safeParse({
      ...BASE,
      run_id: "RunWithCaps",
      kind: "skill-invoke",
      skill_id: "x",
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown discriminator kind", () => {
    const r = EventSchema.safeParse({ ...BASE, kind: "mystery" });
    expect(r.success).toBe(false);
  });

  it("rejects gate-fail missing blockers[]", () => {
    const r = EventSchema.safeParse({
      ...BASE,
      kind: "gate-fail",
      gate_id: "g",
      phase: 1,
    });
    expect(r.success).toBe(false);
  });
});
