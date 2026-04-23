import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  OPT_OUT_ENV,
  listProjects,
  readRegistry,
  recordInit,
} from "../src/utils/registry";

describe("registry", () => {
  let tmp: string;
  let registryPath: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-registry-"));
    registryPath = join(tmp, "registry.json");
    delete process.env[OPT_OUT_ENV];
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
    delete process.env[OPT_OUT_ENV];
  });

  describe("readRegistry", () => {
    it("returns an empty registry when the file is missing", async () => {
      const reg = await readRegistry({ registryPath });
      expect(reg).toEqual({ version: 1, projects: [] });
    });

    it("returns an empty registry when the JSON is malformed", async () => {
      await writeFile(registryPath, "not json at all", "utf8");
      const reg = await readRegistry({ registryPath });
      expect(reg).toEqual({ version: 1, projects: [] });
    });

    it("returns an empty registry when the schema is invalid", async () => {
      await writeFile(registryPath, JSON.stringify({ version: 2, projects: [] }), "utf8");
      const reg = await readRegistry({ registryPath });
      expect(reg.projects).toEqual([]);
    });

    it("returns parsed entries when the file is well-formed", async () => {
      await writeFile(
        registryPath,
        JSON.stringify({
          version: 1,
          projects: [
            {
              slug: "sample",
              path: "/tmp/sample",
              created: "2026-04-23T00:00:00Z",
              version: "0.2.0-alpha.0",
            },
          ],
        }),
        "utf8",
      );
      const reg = await readRegistry({ registryPath });
      expect(reg.projects).toHaveLength(1);
      expect(reg.projects[0]!.slug).toBe("sample");
    });
  });

  describe("recordInit", () => {
    const entry = {
      slug: "alpha",
      path: "/tmp/alpha",
      created: "2026-04-23T00:00:00Z",
      version: "0.2.0-alpha.0",
    };

    it("creates the registry on first write", async () => {
      const result = await recordInit(entry, { registryPath });
      expect(result).toBe("recorded");

      const content = await readFile(registryPath, "utf8");
      const parsed = JSON.parse(content);
      expect(parsed).toEqual({ version: 1, projects: [entry] });
    });

    it("appends to an existing registry without clobbering prior entries", async () => {
      await recordInit(entry, { registryPath });
      const second = { ...entry, slug: "beta", path: "/tmp/beta" };
      await recordInit(second, { registryPath });

      const reg = await readRegistry({ registryPath });
      expect(reg.projects).toHaveLength(2);
      expect(reg.projects.map((p) => p.slug).sort()).toEqual(["alpha", "beta"]);
    });

    it("dedupes by absolute path — re-recording the same path replaces the entry", async () => {
      await recordInit(entry, { registryPath });
      const updated = { ...entry, created: "2026-04-24T00:00:00Z", version: "0.2.0-alpha.1" };
      await recordInit(updated, { registryPath });

      const reg = await readRegistry({ registryPath });
      expect(reg.projects).toHaveLength(1);
      expect(reg.projects[0]!.version).toBe("0.2.0-alpha.1");
    });

    it("returns 'opted-out' when COLDPRESS_NO_REGISTRY=1 is set", async () => {
      process.env[OPT_OUT_ENV] = "1";
      const result = await recordInit(entry, { registryPath });
      expect(result).toBe("opted-out");

      // The file must not exist — opt-out is total.
      await expect(readFile(registryPath, "utf8")).rejects.toThrow();
    });

    it("returns 'recorded' when COLDPRESS_NO_REGISTRY is set to anything other than '1'", async () => {
      process.env[OPT_OUT_ENV] = "0";
      expect(await recordInit(entry, { registryPath })).toBe("recorded");
    });
  });

  describe("listProjects", () => {
    it("returns the projects array from the registry", async () => {
      const entry = {
        slug: "sample",
        path: "/tmp/sample",
        created: "2026-04-23T00:00:00Z",
        version: "0.2.0-alpha.0",
      };
      await recordInit(entry, { registryPath });
      const projects = await listProjects({ registryPath });
      expect(projects).toHaveLength(1);
      expect(projects[0]!.slug).toBe("sample");
    });

    it("returns empty array for missing registry", async () => {
      const projects = await listProjects({ registryPath });
      expect(projects).toEqual([]);
    });
  });
});
