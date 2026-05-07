/**
 * Acceptance tests for schemas/planning-artefacts/adr.schema.json (§4.14).
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

describe("adr schema — acceptance", () => {
  it("validates a complete T2 ADR", () => {
    const doc = {
      name: "adr",
      decision_area: "database",
      phase_authored: 3,
      status: "accepted",
      version: "1.0",
      tier: "T2",
      derived_from: ["_context/planning/stack-shortlist-v1.md"],
      options: ["Convex", "Supabase"],
      chosen: "Convex",
      rubric: {
        fit: 9, cost: 7, team_familiarity: 6, ecosystem: 8,
        lock_in: 5, vibe_fit: 9, weighted_total: 7.5,
      },
    };
    expect(validate(doc)).toBe(true);
  });

  it("validates all three tier values", () => {
    const base = {
      name: "adr", decision_area: "auth", phase_authored: 3, status: "accepted",
      version: "1.0", derived_from: [], options: ["Clerk", "Auth0"], chosen: "Clerk",
      rubric: { fit: 8, cost: 8, team_familiarity: 7, ecosystem: 8, lock_in: 6, vibe_fit: 9, weighted_total: 7.7 },
    };
    for (const tier of ["T1", "T2", "T3"]) {
      expect(validate({ ...base, tier }), `tier ${tier}`).toBe(true);
    }
  });

  it("validates all three status values", () => {
    const base = {
      name: "adr", decision_area: "hosting", phase_authored: 3,
      version: "1.0", tier: "T3", derived_from: [], options: ["Vercel", "Fly.io"], chosen: "Vercel",
      rubric: { fit: 9, cost: 6, team_familiarity: 8, ecosystem: 9, lock_in: 4, vibe_fit: 8, weighted_total: 7.3 },
    };
    for (const status of ["proposed", "accepted", "superseded"]) {
      expect(validate({ ...base, status }), `status ${status}`).toBe(true);
    }
  });

  it("schema compiles from disk (Ajv compile does not throw)", () => {
    expect(validate).toBeDefined();
  });
});
