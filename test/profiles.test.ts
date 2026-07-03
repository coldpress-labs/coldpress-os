import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { describe, expect, it } from "vitest";
import { ProfileSchema, type Profile } from "../schemas/profile.schema";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profilesDir = join(repoRoot, "data/profiles");

const profiles: { file: string; profile: Profile }[] = readdirSync(profilesDir)
  .filter((f) => f.endsWith(".yaml"))
  .map((file) => ({ file, profile: ProfileSchema.parse(parseYaml(readFileSync(join(profilesDir, file), "utf8"))) }));

describe("project profiles (WS9-A)", () => {
  it("ships the harvested roster (profiles backed by real packs)", () => {
    expect(profiles.length).toBeGreaterThanOrEqual(6);
    for (const { profile } of profiles) expect(profile.status).toBe("harvested"); // no speculative profiles
  });

  it("profile id matches its filename", () => {
    for (const { file, profile } of profiles) expect(file).toBe(`${profile.id}.yaml`);
  });

  it("every declared stack_pack exists (harvested, not speculated)", () => {
    for (const { profile } of profiles) {
      if (profile.defaults.stack_pack) {
        expect(existsSync(join(repoRoot, "skills/stack-packs", profile.defaults.stack_pack)), `${profile.id}`).toBe(true);
      }
    }
  });

  it("every declared deploy_pack exists", () => {
    for (const { profile } of profiles) {
      if (profile.defaults.deploy_pack) {
        expect(existsSync(join(repoRoot, "data/deploy-packs", profile.defaults.deploy_pack)), `${profile.id}`).toBe(true);
      }
    }
  });

  it("only research-spike may omit a stack_pack (code profiles must declare one)", () => {
    for (const { profile } of profiles) {
      if (!profile.defaults.stack_pack) expect(profile.defaults.verify_pack).toBe("research-spike");
    }
  });

  it("a deploy_pack is only paired with a compatible stack_pack", () => {
    for (const { profile } of profiles) {
      const { stack_pack, deploy_pack } = profile.defaults;
      if (!deploy_pack || !stack_pack) continue;
      const pack = parseYaml(readFileSync(join(repoRoot, "data/deploy-packs", deploy_pack, "pack.yaml"), "utf8")) as {
        compatible_stacks?: string[];
      };
      expect(pack.compatible_stacks ?? [], `${profile.id}: ${deploy_pack} incompatible with ${stack_pack}`).toContain(stack_pack);
    }
  });
});
