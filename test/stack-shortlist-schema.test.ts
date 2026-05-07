/**
 * Acceptance tests for schemas/planning-artefacts/stack-shortlist.schema.json (§4.14).
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

describe("stack-shortlist schema — acceptance", () => {
  it("validates minimal shortlist", () => {
    const doc = {
      name: "stack-shortlist",
      phase_authored: 3,
      status: "draft",
      version: "1.0",
      derived_from: ["_context/planning/product-brief-v1.md"],
      decision_areas: [
        { area: "database", candidates: ["Convex"], rationale: "Realtime required" },
      ],
    };
    expect(validate(doc)).toBe(true);
  });

  it("validates full shortlist with pack_match and baselines_applicability", () => {
    const doc = {
      name: "stack-shortlist",
      phase_authored: 3,
      status: "final",
      version: "1.0",
      derived_from: ["_context/planning/product-brief-v1.md", "_context/planning/idea-validation-v1.md"],
      pack_match: { matched_pack_name: "nextjs-convex", match_score: 0.9, user_confirmed: true, uncovered_areas: [] },
      baselines_applicability: {
        seo_aeo_llm: "covered",
        accessibility: "partial",
        security: "covered",
        future_proof: "not-covered",
      },
      decision_areas: [
        { area: "database", candidates: ["Convex", "Supabase"], pack_available: true, rationale: "Realtime" },
        { area: "auth", candidates: ["Clerk", "Auth0"], pack_available: true, rationale: "Managed auth" },
      ],
    };
    expect(validate(doc)).toBe(true);
  });

  it("schema compiles from disk (Ajv compile does not throw)", () => {
    expect(validate).toBeDefined();
  });
});
