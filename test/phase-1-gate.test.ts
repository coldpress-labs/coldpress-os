/**
 * Wave 3.5 — specific tests for the rewritten Phase 1 exit gate.
 * Ensures the new 6-check contract is present, schema-valid, and reflects
 * the deep-dive design (block vs. warn severities, skill_ref + artefact_path
 * wiring, next_phase routing).
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PhaseGateSchema } from "../schemas/phase-gate.schema";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const gatePath = join(repoRoot, "lifecycle", "1-bootstrap", "gate.json");

async function loadGate() {
  const raw = await readFile(gatePath, "utf8");
  const parsed = JSON.parse(raw);
  const res = PhaseGateSchema.safeParse(parsed);
  if (!res.success) {
    throw new Error(`phase-1 gate.json failed schema: ${JSON.stringify(res.error.issues, null, 2)}`);
  }
  return res.data;
}

describe("phase-1 gate.json — Wave 3.5 rewrite", () => {
  it("parses against PhaseGateSchema", async () => {
    const gate = await loadGate();
    expect(gate.gate_id).toBe("phase-1-exit");
    expect(gate.phase).toBe(1);
    expect(gate.phase_name).toBe("Bootstrap");
    expect(gate.next_phase).toBe("2-discovery");
  });

  it("has no references to retired submodule-era skills (agent-scaffold, machine-setup, project-init)", async () => {
    const raw = await readFile(gatePath, "utf8");
    expect(raw).not.toContain("agent-scaffold");
    expect(raw).not.toContain("machine-setup");
    expect(raw).not.toContain("project-init");
  });

  it("defines all 6 acceptance checks from the deep-dive design", async () => {
    const gate = await loadGate();
    const ids = gate.acceptance_checks.map((c) => c.id).sort();
    expect(ids).toEqual(
      [
        "phase-1-completed-flag",
        "working-mode-captured",
        "butler-display-name-present",
        "context-seed-authored",
        "context-seed-schema-valid",
        "graph-primed",
        "input-subfolders-walked",
      ].sort(),
    );
  });

  it("graph-primed check is severity=warn (not block) per architectural note 8", async () => {
    const gate = await loadGate();
    const check = gate.acceptance_checks.find((c) => c.id === "graph-primed");
    expect(check?.severity).toBe("warn");
  });

  it("phase-1-completed-flag is block-level", async () => {
    const gate = await loadGate();
    const check = gate.acceptance_checks.find((c) => c.id === "phase-1-completed-flag");
    expect(check?.severity).toBe("block");
    expect(check?.kind).toBe("artefact-present");
    expect(check?.artefact_path).toBe(".coldpress/local-config.yaml");
  });

  it("butler-display-name-present is warn-level (default acceptable)", async () => {
    const gate = await loadGate();
    const check = gate.acceptance_checks.find((c) => c.id === "butler-display-name-present");
    expect(check?.severity).toBe("warn");
  });

  it("context-seed checks route through validate-schema and target the sacred doc", async () => {
    const gate = await loadGate();

    const exists = gate.acceptance_checks.find((c) => c.id === "context-seed-authored");
    expect(exists?.kind).toBe("artefact-present");
    expect(exists?.artefact_path).toBe("_context/sacred/context.md");

    const schemaValid = gate.acceptance_checks.find((c) => c.id === "context-seed-schema-valid");
    expect(schemaValid?.kind).toBe("automated");
    expect(schemaValid?.skill_ref).toBe("validate-schema");
    expect(schemaValid?.severity).toBe("block");
  });

  it("every check carries an actionable remediation hint", async () => {
    const gate = await loadGate();
    for (const check of gate.acceptance_checks) {
      expect(check.remediation, `check ${check.id} missing remediation`).toBeTruthy();
      expect(check.remediation!.length).toBeGreaterThan(10);
    }
  });
});
