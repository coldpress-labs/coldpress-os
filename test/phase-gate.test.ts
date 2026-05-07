/**
 * Tests for the phase-gate protocol — schema + all 9 shipped gate.json files.
 *
 * Ensures:
 *   1. Every phase has a gate.json.
 *   2. Every gate.json is valid against PhaseGateSchema.
 *   3. The `kind`/`skill_ref`/`human_approver`/`artefact_path` invariants
 *      declared in the schema are actually enforced.
 */

import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AcceptanceCheckSchema,
  GateEvaluationSchema,
  PhaseGateSchema,
} from "../schemas/phase-gate.schema";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const lifecycleDir = join(repoRoot, "lifecycle");

async function listPhaseDirs(): Promise<string[]> {
  const entries = await readdir(lifecycleDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && /^\d+-/.test(e.name))
    .map((e) => e.name)
    .sort();
}

describe("PhaseGateSchema — unit", () => {
  const validCheck = {
    id: "prd-authored",
    description: "Sacred document prd.md exists",
    kind: "artefact-present" as const,
    severity: "block" as const,
    artefact_path: "_context/sacred/prd.md",
    remediation: "Run create-prd",
  };

  it("accepts a well-formed gate", () => {
    const gate = {
      schema_version: 1 as const,
      gate_id: "phase-4-exit",
      phase: 4,
      phase_name: "Planning",
      entry_conditions: ["Phase 3 passed", "Sacred docs signed off"],
      acceptance_checks: [validCheck],
      next_phase: "5-breakdown",
    };
    expect(PhaseGateSchema.safeParse(gate).success).toBe(true);
  });

  it("rejects gate with empty acceptance_checks", () => {
    const gate = {
      schema_version: 1 as const,
      gate_id: "phase-4-exit",
      phase: 4,
      phase_name: "Planning",
      entry_conditions: ["Phase 3 passed"],
      acceptance_checks: [],
      next_phase: "5-breakdown",
    };
    expect(PhaseGateSchema.safeParse(gate).success).toBe(false);
  });

  it("rejects phase outside 1-9", () => {
    const base = {
      schema_version: 1 as const,
      gate_id: "phase-10-exit",
      phase_name: "Beyond",
      entry_conditions: ["x"],
      acceptance_checks: [validCheck],
      next_phase: "loop",
    };
    expect(PhaseGateSchema.safeParse({ ...base, phase: 10 }).success).toBe(false);
    expect(PhaseGateSchema.safeParse({ ...base, phase: 0 }).success).toBe(false);
  });

  it("rejects schema_version != 1", () => {
    const gate = {
      schema_version: 2,
      gate_id: "phase-4-exit",
      phase: 4,
      phase_name: "Planning",
      entry_conditions: ["x"],
      acceptance_checks: [validCheck],
      next_phase: "5-breakdown",
    };
    expect(PhaseGateSchema.safeParse(gate).success).toBe(false);
  });
});

describe("AcceptanceCheckSchema — kind × required-fields invariants", () => {
  it("kind=automated requires skill_ref", () => {
    const missing = {
      id: "x",
      description: "some check",
      kind: "automated" as const,
      severity: "block" as const,
      // no skill_ref
    };
    expect(AcceptanceCheckSchema.safeParse(missing).success).toBe(false);

    const present = { ...missing, skill_ref: "some-skill" };
    expect(AcceptanceCheckSchema.safeParse(present).success).toBe(true);
  });

  it("kind=human requires human_approver", () => {
    const missing = {
      id: "x",
      description: "user signoff",
      kind: "human" as const,
      severity: "block" as const,
    };
    expect(AcceptanceCheckSchema.safeParse(missing).success).toBe(false);

    const present = { ...missing, human_approver: "user" };
    expect(AcceptanceCheckSchema.safeParse(present).success).toBe(true);
  });

  it("kind=artefact-present requires artefact_path", () => {
    const missing = {
      id: "x",
      description: "file exists",
      kind: "artefact-present" as const,
      severity: "block" as const,
    };
    expect(AcceptanceCheckSchema.safeParse(missing).success).toBe(false);

    const present = { ...missing, artefact_path: "some/file.md" };
    expect(AcceptanceCheckSchema.safeParse(present).success).toBe(true);
  });

  it("rejects unknown severity", () => {
    const bad = {
      id: "x",
      description: "y",
      kind: "artefact-present" as const,
      severity: "critical" as never,
      artefact_path: "p",
    };
    expect(AcceptanceCheckSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects unknown kind", () => {
    const bad = {
      id: "x",
      description: "y",
      kind: "manual" as never,
      severity: "block" as const,
    };
    expect(AcceptanceCheckSchema.safeParse(bad).success).toBe(false);
  });
});

describe("GateEvaluationSchema — results shape", () => {
  it("accepts a well-formed evaluation", () => {
    const evalResult = {
      gate_id: "phase-4-exit",
      phase: 4,
      evaluated_at: "2026-04-24T15:00:00Z",
      overall: "pass" as const,
      results: [
        { id: "prd-authored", status: "pass" as const },
        { id: "prd-meta", status: "fail" as const, message: "sidecar missing" },
      ],
      blockers: ["prd-meta"],
      warnings: [],
    };
    expect(GateEvaluationSchema.safeParse(evalResult).success).toBe(true);
  });

  it("rejects malformed timestamp", () => {
    const bad = {
      gate_id: "phase-4-exit",
      phase: 4,
      evaluated_at: "last tuesday",
      overall: "pass" as const,
      results: [],
      blockers: [],
      warnings: [],
    };
    expect(GateEvaluationSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects status outside the expected enum", () => {
    const bad = {
      id: "x",
      status: "mostly-passed",
    };
    expect(
      GateEvaluationSchema.safeParse({
        gate_id: "g",
        phase: 4,
        evaluated_at: "2026-04-24T15:00:00Z",
        overall: "pass",
        results: [bad],
        blockers: [],
        warnings: [],
      }).success,
    ).toBe(false);
  });
});

describe("Shipped lifecycle/<N>/gate.json — each phase has a validated gate", () => {
  it("every phase dir has a gate.json", async () => {
    const phaseDirs = await listPhaseDirs();
    expect(phaseDirs.length).toBe(11);

    for (const dir of phaseDirs) {
      const gatePath = join(lifecycleDir, dir, "gate.json");
      const stat = await readFile(gatePath, "utf8").then(() => true).catch(() => false);
      expect(stat, `${dir}/gate.json should exist`).toBe(true);
    }
  });

  it("every gate.json validates against PhaseGateSchema", async () => {
    const phaseDirs = await listPhaseDirs();
    for (const dir of phaseDirs) {
      const gatePath = join(lifecycleDir, dir, "gate.json");
      const content = await readFile(gatePath, "utf8");
      const json = JSON.parse(content);
      const result = PhaseGateSchema.safeParse(json);
      expect(result.success, `${dir}/gate.json: ${JSON.stringify(result)}`).toBe(true);
    }
  });

  it("every gate.json's phase number matches its directory prefix", async () => {
    const phaseDirs = await listPhaseDirs();
    for (const dir of phaseDirs) {
      const match = /^(\d+)-/.exec(dir);
      if (!match) continue;
      const dirPhase = parseInt(match[1]!, 10);

      const gatePath = join(lifecycleDir, dir, "gate.json");
      const json = JSON.parse(await readFile(gatePath, "utf8"));
      expect(json.phase, `${dir}/gate.json .phase`).toBe(dirPhase);
    }
  });

  it("every gate.json's gate_id follows the phase-N-exit convention", async () => {
    const phaseDirs = await listPhaseDirs();
    for (const dir of phaseDirs) {
      const gatePath = join(lifecycleDir, dir, "gate.json");
      const json = JSON.parse(await readFile(gatePath, "utf8"));
      expect(json.gate_id).toMatch(/^phase-\d+-exit$/);
    }
  });

  it("phase 1-7 gates each have at least one block-severity check", async () => {
    const phaseDirs = await listPhaseDirs();
    for (const dir of phaseDirs.filter((d) => /^[1-7]-/.test(d))) {
      const gatePath = join(lifecycleDir, dir, "gate.json");
      const json = JSON.parse(await readFile(gatePath, "utf8"));
      const blockers = (json.acceptance_checks as { severity: string }[]).filter(
        (c) => c.severity === "block",
      );
      expect(
        blockers.length,
        `${dir} should have at least one block-severity check`,
      ).toBeGreaterThanOrEqual(1);
    }
  });
});
