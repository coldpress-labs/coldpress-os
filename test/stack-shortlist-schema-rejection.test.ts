/**
 * Schema rejection fixtures for schemas/planning-artefacts/stack-shortlist.schema.json (§4.14).
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
  const schemaPath = join(__dirname, "../schemas/planning-artefacts/stack-shortlist.schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as object;
  validate = ajv.compile(schema);
});

function validShortlist() {
  return {
    name: "stack-shortlist",
    phase_authored: 3,
    status: "final",
    version: "1.0",
    derived_from: ["_context/planning/product-brief-v1.md"],
    decision_areas: [
      { area: "database", candidates: ["Convex", "Supabase"], rationale: "Realtime sync required" },
    ],
  };
}

describe("stack-shortlist.schema.json — rejection fixtures", () => {
  it("rejects wrong name", () => {
    const sl = { ...validShortlist(), name: "shortlist" };
    expect(validate(sl)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "const")).toBe(true);
  });

  it("rejects wrong phase_authored", () => {
    const sl = { ...validShortlist(), phase_authored: 2 };
    expect(validate(sl)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "const")).toBe(true);
  });

  it("rejects invalid status", () => {
    const sl = { ...validShortlist(), status: "approved" };
    expect(validate(sl)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "enum")).toBe(true);
  });

  it("rejects empty decision_areas array", () => {
    const sl = { ...validShortlist(), decision_areas: [] };
    expect(validate(sl)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "minItems")).toBe(true);
  });

  it("rejects decision area with too many candidates (> 5)", () => {
    const sl = {
      ...validShortlist(),
      decision_areas: [
        {
          area: "database",
          candidates: ["A", "B", "C", "D", "E", "F"],
          rationale: "too many",
        },
      ],
    };
    expect(validate(sl)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "maxItems")).toBe(true);
  });

  it("accepts shortlist with pack_match and baselines_applicability", () => {
    const sl = {
      ...validShortlist(),
      pack_match: {
        matched_pack_name: "nextjs-convex",
        match_score: 0.85,
        user_confirmed: true,
        uncovered_areas: [],
      },
      baselines_applicability: {
        seo_aeo_llm: "covered",
        accessibility: "partial",
        security: "covered",
        future_proof: "partial",
      },
    };
    expect(validate(sl)).toBe(true);
  });

  it("accepts minimal valid shortlist (no optional fields)", () => {
    expect(validate(validShortlist())).toBe(true);
  });
});
