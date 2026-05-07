import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readConditions } from "../src/orchestration/condition-reader";

describe("readConditions", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-conditions-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  async function writeColdpressYaml(body: string): Promise<void> {
    await writeFile(join(tmp, "coldpress.yaml"), body, "utf8");
  }

  async function writeLocalConfig(body: string): Promise<void> {
    await mkdir(join(tmp, ".coldpress"), { recursive: true });
    await writeFile(join(tmp, ".coldpress", "local-config.yaml"), body, "utf8");
  }

  async function writeInputFile(sub: string, name: string): Promise<void> {
    const dir = join(tmp, "_input", sub);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), "content", "utf8");
  }

  it("returns all nulls and empty flags on an empty project", async () => {
    const r = await readConditions({ projectRoot: tmp });
    expect(r.team_shape).toBe(null);
    expect(r.project_shape).toBe(null);
    expect(r.cadence).toBe(null);
    expect(r.preferred_ides).toEqual([]);
    expect(r.product_type_hint).toBe(null);
    expect(r.input_flags).toEqual({
      has_raw: false,
      has_legacy: false,
      has_reference: false,
      has_assets: false,
      has_vendor: false,
    });
  });

  it("reads team_shape, cadence, preferred_ides from coldpress.yaml", async () => {
    await writeColdpressYaml(`
project:
  name: Test
user:
  name: Aastha
  team_shape: team
  cadence: verbose
  preferred_ides:
    - claude-code
    - cursor
`);
    const r = await readConditions({ projectRoot: tmp });
    expect(r.team_shape).toBe("team");
    expect(r.cadence).toBe("verbose");
    expect(r.preferred_ides).toEqual(["claude-code", "cursor"]);
  });

  it("reads project_shape from local-config.yaml", async () => {
    await writeLocalConfig(`project_shape: brownfield\n`);
    const r = await readConditions({ projectRoot: tmp });
    expect(r.project_shape).toBe("brownfield");
  });

  it("rejects out-of-enum values by returning null", async () => {
    await writeColdpressYaml(`user:\n  team_shape: solo-ish\n  cadence: medium\n`);
    await writeLocalConfig(`project_shape: unclear\n`);
    const r = await readConditions({ projectRoot: tmp });
    expect(r.team_shape).toBe(null);
    expect(r.cadence).toBe(null);
    expect(r.project_shape).toBe(null);
  });

  it("reads _input subfolder flags correctly and ignores README.md", async () => {
    // Framework-shipped README must not count as user-loaded content.
    await writeInputFile("raw", "README.md");
    await writeInputFile("legacy", "prior-app.ts");
    await writeInputFile("reference", "article.md");
    // assets + vendor empty.

    const r = await readConditions({ projectRoot: tmp });
    expect(r.input_flags).toEqual({
      has_raw: false, // only README.md — doesn't count
      has_legacy: true,
      has_reference: true,
      has_assets: false,
      has_vendor: false,
    });
  });

  it("counts nested subfolder content in input_flags", async () => {
    const dir = join(tmp, "_input", "vendor", "stripe", "api");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "reference.md"), "content", "utf8");

    const r = await readConditions({ projectRoot: tmp });
    expect(r.input_flags.has_vendor).toBe(true);
  });

  it("tolerates malformed coldpress.yaml — returns defaults", async () => {
    await writeColdpressYaml("this is : not [ valid yaml at all :");
    const r = await readConditions({ projectRoot: tmp });
    expect(r.team_shape).toBe(null);
    expect(r.cadence).toBe(null);
  });

  it("returns preferred_ides as an array of strings only (filters non-strings)", async () => {
    await writeColdpressYaml(`
user:
  preferred_ides:
    - claude-code
    - 42
    - null
    - cursor
`);
    const r = await readConditions({ projectRoot: tmp });
    expect(r.preferred_ides).toEqual(["claude-code", "cursor"]);
  });

  it("honours override paths", async () => {
    // Write the yaml at a non-default location and confirm the override is read.
    await mkdir(join(tmp, "custom"), { recursive: true });
    await writeFile(
      join(tmp, "custom", "cfg.yaml"),
      `user:\n  team_shape: client-project\n`,
      "utf8",
    );
    const r = await readConditions({
      projectRoot: tmp,
      coldpressYamlPath: "custom/cfg.yaml",
    });
    expect(r.team_shape).toBe("client-project");
  });
});
