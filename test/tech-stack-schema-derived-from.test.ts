/**
 * Verifies that schemas/sacred-docs/tech-stack.schema.json requires `derived_from` (§4.4).
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
  const schemaPath = join(__dirname, "../schemas/sacred-docs/tech-stack.schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as object;
  validate = ajv.compile(schema);
});

function validTechStack() {
  return {
    sacred: true,
    version: "1.0",
    governance: "locked",
    workflowType: "tech-stack",
    derived_from: ["_context/planning/adrs/adr-database-v1.md", "_context/sacred/context.md"],
  };
}

describe("tech-stack.schema.json — derived_from required (§4.4)", () => {
  it("validates a complete tech-stack with derived_from", () => {
    expect(validate(validTechStack())).toBe(true);
  });

  it("rejects tech-stack missing derived_from", () => {
    const doc = {
      sacred: true,
      version: "1.0",
      governance: "locked",
      workflowType: "tech-stack",
    };
    expect(validate(doc)).toBe(false);
    expect(validate.errors?.some((e) => e.keyword === "required")).toBe(true);
  });

  it("rejects derived_from containing non-strings", () => {
    const doc = { ...validTechStack(), derived_from: [1, 2] };
    expect(validate(doc)).toBe(false);
  });
});
