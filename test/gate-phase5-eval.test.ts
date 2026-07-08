/**
 * VP2 O28 — the Phase-4/5 exit gates must actually machine-evaluate, not fall to
 * pending. Before the fix, every Phase-5 `acceptance_check` was `kind: "automated"`
 * with only `artefact_path`/`skill_ref` and no `command`, so the runner reported
 * them all `pending` ("0 evaluated") — the gate was honor-system attestation. Now
 * the schema-checkable ones carry real `coldpress validate-schema` commands and the
 * existence ones are `kind: artefact-present`. This runs the REAL shipped
 * `lifecycle/5-design/gate.json` against a fixture project and asserts they evaluate.
 */

import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runGate } from "../src/gate/run";
import { packageRoot } from "../src/utils/paths";

let project: string;
beforeEach(() => {
  project = mkdtempSync(join(tmpdir(), "coldpress-p5gate-"));
});
afterEach(() => rmSync(project, { recursive: true, force: true }));

function write(rel: string, body = "x") {
  const abs = join(project, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body, "utf8");
}

describe("Phase-5 exit gate machine-evaluates (VP2 O28)", () => {
  it("evaluates every non-conditional check instead of reporting them pending", () => {
    // Lay down all the Phase-5 artefacts the gate checks look for.
    write("_context/sacred/prd.md", "---\nsacred: true\ngovernance: \"locked\"\n---\n");
    write("_context/planning/design-brief-v1.md");
    write("_context/design/ux-design-spec-v1.md");
    write("_context/design/brand-guidelines-v1.md");
    write("_context/design/prototype/proto-1/manifest.json"); // mid-path glob
    write("_context/handoffs/phase-5-to-6-2026-01-01.md");

    // Stub the CLI runner so the `validate-schema` command checks resolve without
    // spawning a real process; return 0 (valid).
    const r = runGate(5, { projectDir: project, frameworkDir: packageRoot, run: () => 0, today: "2026-01-01" });

    // Only the conditional a11y-audit stays pending; everything else evaluates.
    expect(r.evaluated).toBeGreaterThanOrEqual(8);
    expect(r.blocked).toBe(false);

    const byId = Object.fromEntries(r.results.map((x) => [x.id, x.status]));
    // Previously-stranded checks now pass (not pending):
    expect(byId["prd-locked"]).toBe("pass"); // artefact-present, mid path exists
    expect(byId["design-brief-validated"]).toBe("pass"); // real validate-schema command ran
    expect(byId["prototype-emitted"]).toBe("pass"); // mid-path glob resolved
    expect(byId["phase-5-handoff-written"]).toBe("pass");
    for (const s of Object.values(byId)) expect(s).not.toBeUndefined();
  });

  it("fails a block check when its artefact is missing (real enforcement, not attestation)", () => {
    // Everything present EXCEPT the handoff → design-deltas-aggregated / handoff checks fail-block.
    write("_context/sacred/prd.md");
    write("_context/planning/design-brief-v1.md");
    write("_context/design/ux-design-spec-v1.md");
    write("_context/design/brand-guidelines-v1.md");
    write("_context/design/prototype/proto-1/manifest.json");
    // no phase-5-to-6 handoff

    const r = runGate(5, { projectDir: project, frameworkDir: packageRoot, run: () => 0, today: "2026-01-01" });
    expect(r.blocked).toBe(true); // the missing handoff is a block-severity artefact check
  });
});
