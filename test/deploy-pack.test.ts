import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { describe, expect, it } from "vitest";
import { DeployPackSchema } from "../schemas/deploy-pack.schema";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packsDir = join(repoRoot, "data", "deploy-packs");

function loadPack(name: string): unknown {
  return parseYaml(readFileSync(join(packsDir, name, "pack.yaml"), "utf8"));
}

describe("deploy-pack contract (WS6-A)", () => {
  const packNames = readdirSync(packsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  it("ships the vercel + cloudflare reference packs first (§2.10 order)", () => {
    expect(packNames).toEqual(expect.arrayContaining(["vercel", "cloudflare"]));
  });

  it("ships the netlify + self-hosted optional packs", () => {
    expect(packNames).toEqual(expect.arrayContaining(["netlify", "self-hosted"]));
  });

  // Every shipped pack — reference + optional — must validate + carry its
  // required fields. Discovered from disk, so a new pack.yaml is covered
  // automatically.
  for (const name of packNames) {
    describe(name, () => {
      it("validates against DeployPackSchema", () => {
        const result = DeployPackSchema.safeParse(loadPack(name));
        if (!result.success) {
          throw new Error(JSON.stringify(result.error.issues, null, 2));
        }
        expect(result.success).toBe(true);
      });

      it("declares staging + production targets and consumes build config from the stack", () => {
        const pack = DeployPackSchema.parse(loadPack(name));
        expect(pack.name).toBe(name);
        expect(pack.targets.staging.deploy_cmd.length).toBeGreaterThan(0);
        expect(pack.targets.production.deploy_cmd.length).toBeGreaterThan(0);
        // The deploy pack takes build values FROM the locked P3 stack.
        expect(pack.stack_inputs).toContain("BUILD_DIR");
        expect(pack.compatible_stacks.length).toBeGreaterThan(0);
      });

      it("preview + rollback capabilities carry their required fields", () => {
        const pack = DeployPackSchema.parse(loadPack(name));
        if (pack.capabilities.deploy_preview) expect(pack.targets.preview).toBeDefined();
        if (pack.capabilities.rollback) expect(pack.rollback_cmd).toBeTruthy();
      });
    });
  }

  it("rejects deploy_preview capability without a preview target", () => {
    const bad = { ...(loadPack("vercel") as Record<string, unknown>) };
    (bad.targets as Record<string, unknown>).preview = undefined;
    expect(DeployPackSchema.safeParse(bad).success).toBe(false);
  });
});
