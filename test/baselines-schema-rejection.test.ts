/**
 * Schema rejection fixtures for schemas/baselines.schema.json (§4.14).
 *
 * Validates both full baselines.yaml source and the coldpress.yaml baselines: block.
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
  const schemaPath = join(__dirname, "../schemas/baselines.schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as object;
  validate = ajv.compile(schema);
});

function validBaselines() {
  return {
    seo_aeo_llm: { status: "confirmed", covered_by_pack: "true" },
    accessibility: { status: "confirmed", covered_by_pack: "partial" },
    security: { status: "confirmed", covered_by_pack: "partial" },
    future_proof: { status: "confirmed", covered_by_pack: "false" },
  };
}

describe("baselines.schema.json — rejection fixtures", () => {
  it("rejects unknown category key", () => {
    const baselines = { ...validBaselines(), performance: { status: "confirmed" } };
    expect(validate(baselines)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "additionalProperties" || e.keyword === "propertyNames")).toBe(true);
  });

  it("rejects invalid status value", () => {
    const baselines = {
      ...validBaselines(),
      seo_aeo_llm: { status: "maybe", covered_by_pack: "true" },
    };
    expect(validate(baselines)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "enum")).toBe(true);
  });

  it("rejects invalid covered_by_pack value", () => {
    const baselines = {
      ...validBaselines(),
      accessibility: { status: "confirmed", covered_by_pack: "yes" },
    };
    expect(validate(baselines)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "enum")).toBe(true);
  });

  it("rejects opted-out without rationale", () => {
    const baselines = {
      ...validBaselines(),
      seo_aeo_llm: { status: "opted-out", covered_by_pack: "false" },
    };
    expect(validate(baselines)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "required")).toBe(true);
  });

  it("rejects missing required status field", () => {
    const baselines = {
      ...validBaselines(),
      future_proof: { covered_by_pack: "false" },
    };
    expect(validate(baselines)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "required")).toBe(true);
  });

  it("accepts opted-out with rationale", () => {
    const baselines = {
      ...validBaselines(),
      seo_aeo_llm: {
        status: "opted-out",
        covered_by_pack: "false",
        rationale: "Internal tool — SEO/AEO irrelevant",
      },
    };
    expect(validate(baselines)).toBe(true);
  });

  it("accepts confirmed-with-override with overrides map", () => {
    const baselines = {
      ...validBaselines(),
      future_proof: {
        status: "confirmed-with-override",
        covered_by_pack: "false",
        overrides: { cwv_lcp_threshold: "2.0s" },
      },
    };
    expect(validate(baselines)).toBe(true);
  });
});
