import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { describe, expect, it } from "vitest";
import { VerifyPackSchema, type VerifyPack } from "../schemas/verify-pack.schema";
import { ProfileSchema } from "../schemas/profile.schema";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const vpDir = join(repoRoot, "data/verify-packs");

const packs: Record<string, VerifyPack> = {};
for (const f of readdirSync(vpDir).filter((x) => x.endsWith(".yaml"))) {
  packs[f.replace(/\.yaml$/, "")] = VerifyPackSchema.parse(parseYaml(readFileSync(join(vpDir, f), "utf8")));
}

describe("verify packs (WS9-C)", () => {
  it("ships web + llm-app + research-spike, all schema-valid", () => {
    expect(Object.keys(packs)).toEqual(expect.arrayContaining(["web", "llm-app", "research-spike"]));
  });

  it("the llm-app pack wires the src/llm-gates normalizers + the deployment LLM skills", () => {
    const llm = packs["llm-app"]!;
    expect(llm.normalizers).toEqual(expect.arrayContaining(["deepeval", "promptfoo", "giskard"]));
    const refs = llm.gates.map((g) => g.skill_ref);
    expect(refs).toContain("skills/deployment/llm-quality-gate");
    expect(refs).toContain("skills/deployment/llm-security-scan");
    expect(refs).toContain("skills/deployment/prompt-regression");
  });

  it("pack name matches its filename", () => {
    for (const [name, pack] of Object.entries(packs)) expect(pack.name).toBe(name);
  });

  it("every profile's verify_pack has a shipped verify pack", () => {
    const profilesDir = join(repoRoot, "data/profiles");
    for (const f of readdirSync(profilesDir).filter((x) => x.endsWith(".yaml"))) {
      const profile = ProfileSchema.parse(parseYaml(readFileSync(join(profilesDir, f), "utf8")));
      expect(packs[profile.defaults.verify_pack], `${profile.id} → ${profile.defaults.verify_pack}`).toBeDefined();
    }
  });
});
