/**
 * Shipped stack-pack validation (audit F6). The rejection-fixture suite covers
 * synthetic packs; this validates every SHIPPED skills/stack-packs/-star-/pack.yaml
 * against pack.schema.json (previously uncovered) and asserts the `testing`
 * block is the L0-L7 shape, not a free-text string.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";
import { beforeAll, describe, expect, it } from "vitest";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packsDir = join(repoRoot, "skills/stack-packs");
const LAYER_KEYS = new Set(["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"]);

let validate: ReturnType<Ajv2020["compile"]>;
beforeAll(() => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  validate = ajv.compile(JSON.parse(readFileSync(join(repoRoot, "schemas/pack.schema.json"), "utf8")) as object);
});

const packDirs = readdirSync(packsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

function loadPack(name: string): Record<string, unknown> {
  return parseYaml(readFileSync(join(packsDir, name, "pack.yaml"), "utf8")) as Record<string, unknown>;
}

// `seo-pack` is a CAPABILITY pack (archetype_fits.invocable_phases), not a
// technology stack pack — it has a different shape and is out of pack.schema.json's
// (the stack-pack descriptor's) scope. Discriminate by that marker.
function isStackPack(name: string): boolean {
  const fits = (loadPack(name).archetype_fits ?? {}) as Record<string, unknown>;
  return !("invocable_phases" in fits);
}

describe("shipped stack packs validate against pack.schema.json", () => {
  const stackPacks = packDirs.filter(isStackPack);

  it("discovers the shipped stack packs", () => {
    expect(stackPacks.length).toBeGreaterThanOrEqual(5);
  });

  it("every shipped stack pack.yaml is schema-valid", () => {
    for (const name of stackPacks) {
      const ok = validate(loadPack(name));
      if (!ok) throw new Error(name + ": " + JSON.stringify(validate.errors, null, 2));
      expect(ok, name).toBe(true);
    }
  });
});

describe("stack-pack testing is the L0-L7 shape (audit F6)", () => {
  const withTesting = packDirs.filter((n) => "testing" in loadPack(n));

  it("the packs that declare testing use the structured layer shape, not a string", () => {
    expect(withTesting.length).toBeGreaterThanOrEqual(4);
    for (const name of withTesting) {
      const testing = loadPack(name).testing as { layers?: Record<string, { tools?: string[] }> };
      expect(typeof testing, name).toBe("object");
      expect(testing.layers, name + " testing.layers").toBeDefined();
      const entries = Object.entries(testing.layers ?? {});
      expect(entries.length, name + " has at least one layer").toBeGreaterThan(0);
      for (const [k, cfg] of entries) {
        expect(LAYER_KEYS.has(k), name + ": " + k + " is a valid L0-L7 layer").toBe(true);
        expect((cfg.tools ?? []).length, name + "." + k + ".tools non-empty").toBeGreaterThan(0);
      }
    }
  });

  it("no pack still declares testing as a free-text pre_picked string", () => {
    for (const name of packDirs) {
      const pre = ((loadPack(name).pre_picked ?? {}) as Record<string, unknown>);
      expect("testing" in pre, name + " pre_picked should not carry a free-text testing string").toBe(false);
    }
  });
});
