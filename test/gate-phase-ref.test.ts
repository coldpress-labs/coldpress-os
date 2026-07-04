/**
 * WS11 S1.2 — lane-aware phase-id parsing for `coldpress gate check|enter`.
 *
 * Before WS11 the CLI did `Number(phase)`, so `1-bootstrap` and `lite:spec` both
 * parsed to NaN → "no gate.json found for phase NaN". parsePhaseRef routes the
 * full lane (numbered) and the lite lane (named) correctly, and findGateJson
 * resolves each lane's gate.json location.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parsePhaseRef, findGateJson, runGate } from "../src/gate/run";

describe("parsePhaseRef (WS11 S1.2)", () => {
  it("parses a bare integer as the full lane", () => {
    expect(parsePhaseRef("3")).toEqual({ lane: "full", n: 3, label: "3" });
    expect(parsePhaseRef(3)).toEqual({ lane: "full", n: 3, label: "3" });
  });

  it("parses a numbered dir name (the audit's failing case) as the full lane", () => {
    expect(parsePhaseRef("1-bootstrap")).toEqual({ lane: "full", n: 1, label: "1-bootstrap" });
    expect(parsePhaseRef("11-evolve")).toEqual({ lane: "full", n: 11, label: "11-evolve" });
  });

  it("parses a lite-lane id (the audit's other failing case)", () => {
    expect(parsePhaseRef("lite:spec")).toEqual({ lane: "lite", slug: "spec", label: "lite:spec" });
    expect(parsePhaseRef("lite/build")).toEqual({ lane: "lite", slug: "build", label: "lite/build" });
  });

  it("returns null for an unparseable id (CLI surfaces a helpful error, not NaN)", () => {
    expect(parsePhaseRef("not-a-phase!")).toBeNull();
    expect(parsePhaseRef("")).toBeNull();
    expect(parsePhaseRef(NaN)).toBeNull();
  });
});

describe("findGateJson lane routing (WS11 S1.2)", () => {
  let fw: string;
  beforeEach(() => {
    fw = mkdtempSync(join(tmpdir(), "cp-phaseref-fw-"));
    mkdirSync(join(fw, "lifecycle", "3-tech-stack"), { recursive: true });
    writeFileSync(join(fw, "lifecycle", "3-tech-stack", "gate.json"), "{}");
    mkdirSync(join(fw, "lifecycle", "lite", "spec"), { recursive: true });
    writeFileSync(join(fw, "lifecycle", "lite", "spec", "gate.json"), "{}");
    mkdirSync(join(fw, "lifecycle", "lite", "build"), { recursive: true }); // no gate.json
  });
  afterEach(() => rmSync(fw, { recursive: true, force: true }));

  it("resolves full-lane gate.json by leading number for a dir-name id", () => {
    const ref = parsePhaseRef("3-tech-stack")!;
    expect(findGateJson(ref, fw)).toBe(join(fw, "lifecycle", "3-tech-stack", "gate.json"));
  });

  it("resolves lite-lane gate.json under lifecycle/lite/<slug>/", () => {
    const ref = parsePhaseRef("lite:spec")!;
    expect(findGateJson(ref, fw)).toBe(join(fw, "lifecycle", "lite", "spec", "gate.json"));
  });

  it("returns undefined (not an error) for a lite phase with no gate.json", () => {
    const ref = parsePhaseRef("lite:build")!;
    expect(findGateJson(ref, fw)).toBeUndefined();
  });
});

describe("runGate threads the phase label (WS11 S1.2)", () => {
  let fw: string;
  let proj: string;
  beforeEach(() => {
    fw = mkdtempSync(join(tmpdir(), "cp-phaseref-fw2-"));
    proj = mkdtempSync(join(tmpdir(), "cp-phaseref-proj-"));
    mkdirSync(join(fw, "lifecycle", "2-discovery"), { recursive: true });
    writeFileSync(
      join(fw, "lifecycle", "2-discovery", "gate.json"),
      JSON.stringify({ gate_id: "phase-2-exit", acceptance_checks: [] }),
    );
  });
  afterEach(() => {
    rmSync(fw, { recursive: true, force: true });
    rmSync(proj, { recursive: true, force: true });
  });

  it("reports the given label for a dir-name id (previously NaN)", () => {
    const r = runGate("2-discovery", { projectDir: proj, frameworkDir: fw, run: () => 0 });
    expect(r.phase).toBe("2-discovery");
    expect(r.gate_id).toBe("phase-2-exit");
  });

  it("reports the label for a lite id with no gate as a clean no-gate report", () => {
    const r = runGate("lite:ship", { projectDir: proj, frameworkDir: fw, run: () => 0 });
    expect(r.phase).toBe("lite:ship");
    expect(r.evaluated).toBe(0);
    expect(r.pending).toBe(0);
  });
});
