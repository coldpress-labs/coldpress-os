/**
 * VP2 O32 — the meta-sidecar + phase-handoff schemas are now wired into routing,
 * so the CLI verb AND the write-time hook validate them (they were silently
 * "no schema, no opinion" before). Includes the phase-handoff ref-resolution guard.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { pathPatternSchemaFromPath, validateDocSchema } from "../src/governance/validate-schema";
import { dataArtefactSchemaForPath } from "../schemas/data-artefacts/index";

describe("meta-sidecar routing is registered (VP2 O32)", () => {
  it("architecture.meta.json routes to architecture-meta schema", () => {
    expect(pathPatternSchemaFromPath("_context/sacred/architecture.meta.json")).toBe(
      "handoffs/architecture-meta.schema.json",
    );
  });
  it("phase-N-to-M meta sidecar routes to phase-handoff schema", () => {
    expect(pathPatternSchemaFromPath("_context/handoffs/phase-6-to-7-2026-01-01.meta.json")).toBe(
      "handoffs/phase-handoff.schema.json",
    );
  });
  it("prd.meta.json routes via the data-artefact registry", () => {
    expect(dataArtefactSchemaForPath("_context/sacred/prd.meta.json")).toBeDefined();
  });
});

describe("phase-handoff schema compiles with its cross-refs resolved (VP2 O32)", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-hnd-"));
    mkdirSync(join(dir, "_context/handoffs"), { recursive: true });
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("validates a minimal phase-handoff sidecar (ref-preload works, no compile error)", async () => {
    const p = join(dir, "_context/handoffs/phase-1-to-2-2026-01-01.meta.json");
    writeFileSync(
      p,
      JSON.stringify({
        schema: "schemas/handoffs/phase-handoff.json",
        from_phase: 1,
        to_phase: 2,
        from_phase_name: "Bootstrap",
        to_phase_name: "Discovery",
        created_at: "2026-01-01T00:00:00Z",
        author_agent: "butler",
        summary: "Bootstrap complete; handing off to Discovery.",
        outputs_emitted: [{ artefact_path: "_context/sacred/context.md", artefact_kind: "sacred-doc" }],
        next_phase_inputs: [{ path: "_context/sacred/context.md", purpose: "founding context for discovery" }],
      }),
      "utf8",
    );
    const r = await validateDocSchema(p);
    // The key assertion is that it COMPILED (no "can't resolve reference design-delta.json").
    expect(r.schema_used).toBe("handoffs/phase-handoff.schema.json");
    expect(r.ok, JSON.stringify(r.ok ? [] : r.issues)).toBe(true);
  });
});
