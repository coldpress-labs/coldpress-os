/**
 * Schema rejection fixtures for schemas/pack.schema.json (§4.14).
 *
 * Each test constructs a pack descriptor that violates exactly one constraint
 * and asserts Ajv rejects it with the expected error keyword.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it, beforeAll } from "vitest";

let validate: ReturnType<Ajv2020["compile"]>;

beforeAll(() => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const schemaPath = join(__dirname, "../schemas/pack.schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as object;
  validate = ajv.compile(schema);
});

function validPack() {
  return {
    name: "nextjs-convex",
    archetype_fits: {
      product_types: ["saas"],
      domain_complexity: ["medium"],
      functional_profile: ["realtime", "auth"],
    },
    pre_picked: { database: "Convex", auth: "Clerk" },
    overrideable: true,
    baselines_out_of_box: ["seo_aeo_llm", "security"],
    quickstart_skill: "skills/stack-packs/nextjs-convex/quickstart",
  };
}

describe("pack.schema.json — rejection fixtures", () => {
  it("rejects missing name", () => {
    const pack = validPack();
    delete (pack as Record<string, unknown>)["name"];
    expect(validate(pack)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "required")).toBe(true);
  });

  it("rejects name with uppercase (pattern violation)", () => {
    const pack = { ...validPack(), name: "NextJS-Convex" };
    expect(validate(pack)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "pattern")).toBe(true);
  });

  it("rejects invalid domain_complexity value", () => {
    const pack = {
      ...validPack(),
      archetype_fits: { domain_complexity: ["extreme"] },
    };
    expect(validate(pack)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "enum")).toBe(true);
  });

  it("rejects overrideable: false (must be const true)", () => {
    const pack = { ...validPack(), overrideable: false };
    expect(validate(pack)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "const")).toBe(true);
  });

  it("rejects invalid baselines_out_of_box value", () => {
    const pack = { ...validPack(), baselines_out_of_box: ["performance"] };
    expect(validate(pack)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "enum")).toBe(true);
  });

  it("rejects quickstart_skill not matching pattern", () => {
    const pack = { ...validPack(), quickstart_skill: "lib/pack/quickstart" };
    expect(validate(pack)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "pattern")).toBe(true);
  });

  it("accepts pack with empty pre_picked and empty baselines_out_of_box", () => {
    const pack = { ...validPack(), pre_picked: {}, baselines_out_of_box: [] };
    expect(validate(pack)).toBe(true);
  });
});
