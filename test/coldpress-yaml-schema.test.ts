/**
 * Acceptance tests for schemas/coldpress-yaml.schema.ts — the whole-file
 * `coldpress.yaml` schema (action plan §4.1 / §4.9; closes audit §2.5).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { describe, expect, it } from "vitest";
import { ColdpressYamlSchema, parseColdpressYaml } from "../schemas/coldpress-yaml.schema";

const repoRoot = join(__dirname, "..");

describe("ColdpressYamlSchema — valid configs", () => {
  it("accepts a filled Phase-1 scaffold (init output shape)", () => {
    const cfg = parseColdpressYaml({
      project: { name: "My Project", slug: "my-project" },
      user: { name: "Aastha", communication_language: "English", document_output_language: "English" },
      butler: { display_name: "Butler" },
    });
    expect(cfg.project.slug).toBe("my-project");
  });

  it("validates the real template/coldpress.yaml once name+slug are filled", () => {
    const raw = readFileSync(join(repoRoot, "template/coldpress.yaml"), "utf8");
    const parsed = parseYaml(raw) as Record<string, { name?: string; slug?: string }>;
    // The shipped template is a blank scaffold (name/slug ""); `coldpress init`
    // fills them. Simulate the filled result and assert it is schema-valid.
    parsed.project = { ...parsed.project, name: "Demo", slug: "demo" };
    expect(() => parseColdpressYaml(parsed)).not.toThrow();
  });

  it("accepts a mid-lifecycle config (stack_pack, baselines, sacred_docs, agents)", () => {
    const cfg = parseColdpressYaml({
      project: { name: "Shop", slug: "shop", type: "webapp", domain: "commerce", pattern: "b" },
      user: { name: "A", cadence: "summary", team_shape: "client-project" },
      stack_pack: "vibe-coder-fullstack",
      baselines: { security: { status: "confirmed", covered_by_pack: true } },
      agents: { analyst: { mode: "full" }, qa: { depth: "strategic" } },
      sacred_docs: { prd: "_context/sacred/prd.md" },
    });
    expect(cfg.stack_pack).toBe("vibe-coder-fullstack");
  });

  it("accepts the v0.4 fields (profile, lane, security_tier, interop, packs)", () => {
    const cfg = parseColdpressYaml({
      project: { name: "Voice", slug: "voice" },
      profile: "voice-agent",
      lane: "full",
      security_tier: "T2",
      interop: ["agents-md", "cursor"],
      deploy_pack: "vercel",
      verify_pack: "llm-app",
    });
    expect(cfg.lane).toBe("full");
    expect(cfg.interop).toEqual(["agents-md", "cursor"]);
  });

  it("passes through stack-pack-specific blocks (e.g. convex:) untouched", () => {
    const cfg = parseColdpressYaml({
      project: { name: "P", slug: "p" },
      stack_pack: "vibe-coder-fullstack",
      convex: { project_id: "abc", deployment: "prod" },
    });
    expect((cfg as Record<string, unknown>).convex).toEqual({ project_id: "abc", deployment: "prod" });
  });
});

describe("ColdpressYamlSchema — rejected configs", () => {
  it("rejects a missing project block", () => {
    expect(() => parseColdpressYaml({ user: { name: "A" } })).toThrow();
  });

  it("rejects an empty project.name / slug (required at phase boundaries)", () => {
    expect(() => parseColdpressYaml({ project: { name: "", slug: "" } })).toThrow();
  });

  it("rejects an invalid lane / security_tier", () => {
    expect(() => parseColdpressYaml({ project: { name: "P", slug: "p" }, lane: "medium" })).toThrow();
    expect(() => parseColdpressYaml({ project: { name: "P", slug: "p" }, security_tier: "T5" })).toThrow();
  });

  it("rejects an unknown interop target", () => {
    expect(() => parseColdpressYaml({ project: { name: "P", slug: "p" }, interop: ["vscode"] })).toThrow();
  });

  it("rejects an invalid cadence enum", () => {
    const r = ColdpressYamlSchema.safeParse({ project: { name: "P", slug: "p" }, user: { cadence: "loud" } });
    expect(r.success).toBe(false);
  });
});
