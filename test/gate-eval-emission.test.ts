/**
 * VP2 O40 — the GateEvaluation audit artifact must be produced mechanically.
 *
 * `evaluate-phase-gate/SKILL.md` §4 specifies it, `GateEvaluationSchema` types it,
 * and `src/dashboard/tabs/status.ts` globs `gate-eval-phase-N-YYYY-MM-DD.json` to
 * surface `last_gate_evaluation` — but nothing produced it. It relied on an agent
 * hand-authoring the JSON, so emission silently stopped after Phase 7 in VP2 and the
 * dashboard froze. `coldpress gate check <N> --emit` now writes it from the runner's
 * own results.
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { emitGateEvaluation, runGateCheck } from "../src/commands/gate";
import { GateEvaluationSchema } from "../schemas/phase-gate.schema";

/** The exact pattern src/dashboard/tabs/status.ts scans for. */
const DASHBOARD_GLOB = /^gate-eval-phase-\d+-\d{4}-\d{2}-\d{2}\.json$/;

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-gateeval-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("emitGateEvaluation", () => {
  const report = {
    phase: "5",
    gate_id: "phase-5-exit",
    results: [
      { id: "a-pass", severity: "block", kind: "artefact-present", status: "pass" as const, detail: "present" },
      { id: "a-fail", severity: "block", kind: "artefact-present", status: "fail" as const, detail: "missing" },
      { id: "a-warn", severity: "warn", kind: "artefact-present", status: "fail" as const, detail: "missing" },
      { id: "a-pend", severity: "block", kind: "agent", status: "pending" as const, detail: "needs agent" },
    ],
    blocked: true,
    pending: 1,
    evaluated: 3,
  };

  it("writes a schema-valid artifact at the dashboard's filename", () => {
    const p = emitGateEvaluation(report as never, 5, dir);
    expect(p).toBeTruthy();
    expect(DASHBOARD_GLOB.test(p!.split("/").pop()!)).toBe(true);
    const parsed = GateEvaluationSchema.safeParse(JSON.parse(readFileSync(p!, "utf8")));
    expect(parsed.success, JSON.stringify(parsed.success ? [] : parsed.error.issues)).toBe(true);
  });

  it("maps runner statuses/severities onto the schema's vocabulary", () => {
    const p = emitGateEvaluation(report as never, 5, dir);
    const ev = JSON.parse(readFileSync(p!, "utf8"));
    expect(ev.overall).toBe("fail"); // a block check failed
    expect(ev.blockers).toEqual(["a-fail"]); // block-severity failures only
    expect(ev.warnings).toEqual(["a-warn"]); // warn-severity failures only
    expect(ev.results.find((r: { id: string }) => r.id === "a-pend").status).toBe("pending-human");
    expect(ev.results.find((r: { id: string }) => r.id === "a-warn").requires_sign_off).toBe(true);
  });

  it("returns null for a non-numeric (lite-lane) phase rather than writing junk", () => {
    expect(emitGateEvaluation(report as never, undefined, dir)).toBeNull();
    expect(existsSync(join(dir, "_context/audit"))).toBe(false);
  });
});

describe("gate check --emit (end to end, real shipped gate)", () => {
  it("writes the artifact the dashboard can find", () => {
    const write = (rel: string, body = "x") => {
      const abs = join(dir, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, body, "utf8");
    };
    write("_context/sacred/prd.md");
    write("_context/planning/design-brief-v1.md");
    write("_context/design/ux-design-spec-v1.md");
    write("_context/design/brand-guidelines-v1.md");
    write("_context/design/prototype/p1/manifest.json");
    write("_context/handoffs/phase-5-to-6-2026-01-01.md");

    runGateCheck("5", { projectDir: dir, emit: true });

    const emitted = readdirSync(join(dir, "_context/audit")).filter((f) => DASHBOARD_GLOB.test(f));
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toMatch(/^gate-eval-phase-5-/);
    expect(GateEvaluationSchema.safeParse(JSON.parse(readFileSync(join(dir, "_context/audit", emitted[0]!), "utf8"))).success).toBe(true);
  });
});
