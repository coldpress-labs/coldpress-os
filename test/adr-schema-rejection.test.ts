/**
 * Schema rejection fixtures for schemas/planning-artefacts/adr.schema.json (§4.14).
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
  const schemaPath = join(__dirname, "../schemas/planning-artefacts/adr.schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as object;
  validate = ajv.compile(schema);
});

function validAdr() {
  return {
    name: "adr",
    decision_area: "database",
    phase_authored: 3,
    status: "accepted",
    version: "1.0",
    tier: "T2",
    derived_from: ["_context/planning/stack-shortlist-v1.md"],
    options: ["Convex", "Supabase", "PlanetScale"],
    chosen: "Convex",
    rubric: {
      fit: 9,
      cost: 7,
      team_familiarity: 6,
      ecosystem: 8,
      lock_in: 5,
      vibe_fit: 9,
      weighted_total: 7.5,
    },
  };
}

describe("adr.schema.json — rejection fixtures", () => {
  it("rejects wrong name (not 'adr')", () => {
    const adr = { ...validAdr(), name: "architecture-decision-record" };
    expect(validate(adr)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "const")).toBe(true);
  });

  it("rejects wrong phase_authored (not 3)", () => {
    const adr = { ...validAdr(), phase_authored: 4 };
    expect(validate(adr)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "const")).toBe(true);
  });

  it("rejects invalid status", () => {
    const adr = { ...validAdr(), status: "draft" };
    expect(validate(adr)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "enum")).toBe(true);
  });

  it("rejects invalid tier value", () => {
    const adr = { ...validAdr(), tier: "T4" };
    expect(validate(adr)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "enum")).toBe(true);
  });

  it("rejects fewer than 2 options", () => {
    const adr = { ...validAdr(), options: ["Convex"] };
    expect(validate(adr)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "minItems")).toBe(true);
  });

  it("rejects rubric dimension out of range (> 10)", () => {
    const adr = {
      ...validAdr(),
      rubric: { ...validAdr().rubric, fit: 11 },
    };
    expect(validate(adr)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "maximum")).toBe(true);
  });

  it("rejects rubric with missing required dimension", () => {
    const { vibe_fit: _vf, ...rubricWithout } = validAdr().rubric;
    const adr = { ...validAdr(), rubric: rubricWithout };
    expect(validate(adr)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "required")).toBe(true);
  });

  it("accepts all three tier values", () => {
    for (const tier of ["T1", "T2", "T3"]) {
      const adr = { ...validAdr(), tier };
      expect(validate(adr), `tier ${tier} should be valid`).toBe(true);
    }
  });
});
