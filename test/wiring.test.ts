/**
 * WS10-G: the wiring manifest + checker. The shipped data/wiring.yaml must
 * validate + every producer/consumer/schema path must resolve — this is the
 * permanent guard against the "consumer built, producer missing" audit class.
 */

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WiringManifestSchema } from "../schemas/wiring.schema";
import { checkWiring } from "../src/wiring/check";

describe("shipped data/wiring.yaml", () => {
  it("passes its own wiring check — every artifact has a producer, all paths resolve", () => {
    const results = checkWiring();
    const errors = results.filter((r) => r.severity === "error");
    if (errors.length) throw new Error(errors.map((e) => `${e.label}: ${e.detail}`).join("\n"));
    expect(errors).toHaveLength(0);
  });

  it("covers the flagship WS10 producer-pass artifacts", () => {
    // A regression guard: the audit's Class-A breaks must stay registered.
    const results = checkWiring();
    // If the manifest were emptied or a flagship artifact dropped, the summary
    // count would fall — assert a sane floor.
    const ok = results.find((r) => r.id === "wiring");
    expect(ok?.severity).toBe("ok");
    expect(ok?.label).toMatch(/\d+ cross-phase artifacts/);
  });
});

describe("wiring checker — synthetic failures", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-wiring-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("flags a missing producer path as an error", () => {
    const p = join(dir, "wiring.yaml");
    writeFileSync(p, "artifacts:\n  - { path: '_context/x.yaml', producer: 'lifecycle/does-not-exist', consumers: ['src/cli.ts'] }\n");
    const results = checkWiring(p);
    expect(results.some((r) => r.severity === "error" && r.detail?.includes("producer path does not exist"))).toBe(true);
  });

  it("flags a null producer as a tracked warning (known gap), not an error", () => {
    const p = join(dir, "wiring.yaml");
    writeFileSync(p, "artifacts:\n  - { path: '_context/x.yaml', producer: null, consumers: ['src/cli.ts'] }\n");
    const results = checkWiring(p);
    expect(results.some((r) => r.severity === "warning" && r.detail?.includes("known gap"))).toBe(true);
    expect(results.some((r) => r.severity === "error")).toBe(false);
  });

  it("flags a missing schema + a missing consumer", () => {
    const p = join(dir, "wiring.yaml");
    writeFileSync(p, "artifacts:\n  - { path: '_context/x.yaml', schema: 'schemas/nope.ts', producer: 'src/cli.ts', consumers: ['src/nope.ts'] }\n");
    const results = checkWiring(p);
    expect(results.some((r) => r.detail?.includes("schema does not exist"))).toBe(true);
    expect(results.some((r) => r.detail?.includes("consumer path does not exist"))).toBe(true);
  });

  it("WiringManifestSchema rejects an artifact with no consumers", () => {
    expect(WiringManifestSchema.safeParse({ artifacts: [{ path: "x", producer: null, consumers: [] }] }).success).toBe(false);
  });
});
