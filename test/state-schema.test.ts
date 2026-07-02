/**
 * Acceptance tests for schemas/state.schema.ts — `.coldpress/state.yaml`,
 * the single orchestration truth (action plan §4.1 / operating model §II.1).
 */

import { describe, expect, it } from "vitest";
import { parseState, StateSchema } from "../schemas/state.schema";

/** The operating-model §II.1 example, plus the §4.1 required additions. */
const validFullLane = {
  lane: "full",
  phase: 8,
  phase_status: "in_progress",
  security_tier: "T1",
  enforcement: "on",
  iteration: 0,
  gates: {
    p7: { stories_schema_valid: true, ownership_map_present: true, exited: "2026-07-01T12:00:00Z" },
    p8: { stories_done: 7, stories_total: 12 },
  },
  active_stories: ["ST-008", "ST-011"],
  deltas_open: { design: 0, architecture: 1 },
  deploy: { pack: "cloudflare", staging_smoke: null, prod: null },
};

describe("StateSchema — valid states", () => {
  it("accepts the operating-model §II.1 full-lane example", () => {
    const s = parseState(validFullLane);
    expect(s.lane).toBe("full");
    expect(s.phase).toBe(8);
    expect(s.security_tier).toBe("T1");
    expect(s.enforcement).toBe("on");
    expect(s.gates.p8?.stories_done).toBe(7);
  });

  it("accepts a lite-lane named phase", () => {
    const s = parseState({
      lane: "lite",
      phase: "build",
      phase_status: "in_progress",
      security_tier: "T0",
      enforcement: "on",
    });
    expect(s.phase).toBe("build");
  });

  it("applies defaults for optional collections", () => {
    const s = parseState({
      lane: "lite",
      phase: "spec",
      phase_status: "entering",
      security_tier: "T0",
      enforcement: "on",
    });
    expect(s.gates).toEqual({});
    expect(s.active_stories).toEqual([]);
    expect(s.deltas_open).toEqual({});
    expect(s.deploy).toEqual({});
  });

  it("allows pack-specific extra keys on deploy (WS6 forward-compat)", () => {
    const s = parseState({
      lane: "full",
      phase: 9,
      phase_status: "in_progress",
      security_tier: "T2",
      enforcement: "on",
      deploy: { pack: "vercel", staging_smoke: true, prod: null, preview_url: "https://x" },
    });
    expect((s.deploy as Record<string, unknown>).preview_url).toBe("https://x");
  });
});

describe("StateSchema — rejected states", () => {
  it("rejects an unknown top-level key (typo guard on the routing spine)", () => {
    expect(() =>
      parseState({
        lane: "full",
        phase: 3,
        phase_status: "in_progress",
        security_teir: "T1", // typo
        enforcement: "on",
      }),
    ).toThrow();
  });

  it("rejects an out-of-range numeric phase", () => {
    expect(() => parseState({ lane: "full", phase: 12, phase_status: "entering", security_tier: "T0", enforcement: "on" })).toThrow();
  });

  it("rejects an invalid security tier", () => {
    expect(() => parseState({ lane: "full", phase: 1, phase_status: "entering", security_tier: "T3", enforcement: "on" })).toThrow();
  });

  it("rejects an invalid enforcement mode", () => {
    expect(() => parseState({ lane: "full", phase: 1, phase_status: "entering", security_tier: "T0", enforcement: "paused" })).toThrow();
  });

  it("rejects a missing required field", () => {
    expect(() => parseState({ lane: "full", phase: 1, phase_status: "entering", security_tier: "T0" })).toThrow();
  });

  it("safeParse surfaces field-level issues without throwing", () => {
    const r = StateSchema.safeParse({ lane: "sideways", phase: 1, phase_status: "entering", security_tier: "T0", enforcement: "on" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.join(".") === "lane")).toBe(true);
    }
  });
});
