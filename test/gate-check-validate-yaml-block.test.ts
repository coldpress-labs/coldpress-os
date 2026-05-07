/**
 * Unit tests for src/gate/checks/validate-yaml-block.ts (§4.14).
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validateYamlBlock } from "../src/gate/checks/validate-yaml-block";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-yaml-block-"));
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

const VALID_BASELINES_YAML = `
project:
  name: test
stack_pack: ""
baselines:
  seo_aeo_llm:
    status: confirmed
    covered_by_pack: "true"
  accessibility:
    status: confirmed
    covered_by_pack: "partial"
  security:
    status: confirmed
    covered_by_pack: "partial"
  future_proof:
    status: opted-out
    covered_by_pack: "false"
    rationale: "Internal tool"
`;

describe("validateYamlBlock", () => {
  it("passes when baselines block is valid", async () => {
    const filePath = join(workDir, "coldpress.yaml");
    await writeFile(filePath, VALID_BASELINES_YAML, "utf8");
    const result = await validateYamlBlock(filePath, "baselines", "baselines.schema.json");
    expect(result.ok).toBe(true);
  });

  it("fails when baselines block is absent", async () => {
    const filePath = join(workDir, "coldpress.yaml");
    await writeFile(filePath, "project:\n  name: test\n", "utf8");
    const result = await validateYamlBlock(filePath, "baselines", "baselines.schema.json");
    expect(result.ok).toBe(false);
    expect(result.message).toContain('"baselines:" not found');
  });

  it("fails when category has invalid status value", async () => {
    const filePath = join(workDir, "coldpress.yaml");
    await writeFile(filePath, `
baselines:
  seo_aeo_llm:
    status: unknown
    covered_by_pack: "false"
`, "utf8");
    const result = await validateYamlBlock(filePath, "baselines", "baselines.schema.json");
    expect(result.ok).toBe(false);
    expect(result.issues?.some((i) => i.keyword === "enum")).toBe(true);
  });
});
