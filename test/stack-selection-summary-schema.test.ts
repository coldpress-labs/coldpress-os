/**
 * Acceptance tests for schemas/distillates/stack-selection-summary.schema.json (§4.14).
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
  const schemaPath = join(__dirname, "../schemas/distillates/stack-selection-summary.schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as object;
  validate = ajv.compile(schema);
});

describe("stack-selection-summary schema — acceptance", () => {
  it("validates minimal summary", () => {
    const doc = {
      name: "stack-selection-summary",
      phase_authored: 3,
      status: "final",
      derived_from: ["_context/sacred/tech-stack.md", "_context/planning/adrs/adr-database-v1.md"],
      version: "1.0",
      regeneratable: true,
    };
    expect(validate(doc)).toBe(true);
  });

  it("rejects regeneratable: false", () => {
    const doc = {
      name: "stack-selection-summary",
      phase_authored: 3,
      status: "final",
      derived_from: [],
      version: "1.0",
      regeneratable: false,
    };
    expect(validate(doc)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "const")).toBe(true);
  });

  it("schema compiles from disk (Ajv compile does not throw)", () => {
    expect(validate).toBeDefined();
  });
});
