/**
 * Project archetype tests (§6.3).
 *
 * Covers:
 *   - Schema invariants (slug, phase clamp, disable/enable mutual exclusion)
 *   - Loader (happy, not-found, malformed YAML, schema-invalid, id↔filename mismatch)
 *   - Every shipped archetype validates against the schema
 *   - SHIPPED_ARCHETYPES contains exactly the 4 v1 manifests on disk
 */

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ArchetypeManifestSchema,
  ArchetypeSkillOverridesSchema,
  ArchetypeSubagentOverrideSchema,
  ArchetypeTemplateOverrideSchema,
  SHIPPED_ARCHETYPES,
} from "../schemas/archetype.schema";
import {
  ArchetypeManifestError,
  ArchetypeNotFoundError,
  isShippedArchetype,
  loadArchetype,
  loadShippedArchetypes,
} from "../src/archetypes/load";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const shippedDir = join(repoRoot, "install/archetypes");

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-archetype-"));
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe("ArchetypeSubagentOverrideSchema", () => {
  it("accepts a valid swap", () => {
    expect(
      ArchetypeSubagentOverrideSchema.safeParse({
        phase: 6,
        replace: "developer",
        replace_with: "data-interpreter",
        reason: "data-shaped impl",
      }).success,
    ).toBe(true);
  });

  it("rejects phase 0 / 10", () => {
    expect(
      ArchetypeSubagentOverrideSchema.safeParse({
        phase: 10,
        replace: "developer",
        replace_with: "x",
        reason: "y",
      }).success,
    ).toBe(false);
    expect(
      ArchetypeSubagentOverrideSchema.safeParse({
        phase: 0,
        replace: "developer",
        replace_with: "x",
        reason: "y",
      }).success,
    ).toBe(false);
  });

  it("rejects non-slug subagent ids", () => {
    expect(
      ArchetypeSubagentOverrideSchema.safeParse({
        phase: 6,
        replace: "Developer!",
        replace_with: "x",
        reason: "y",
      }).success,
    ).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(
      ArchetypeSubagentOverrideSchema.safeParse({
        phase: 6,
        replace: "developer",
        replace_with: "x",
        reason: "",
      }).success,
    ).toBe(false);
  });
});

describe("ArchetypeSkillOverridesSchema", () => {
  it("accepts disjoint disable + enable", () => {
    expect(
      ArchetypeSkillOverridesSchema.safeParse({
        disable: ["a"],
        enable: ["b"],
      }).success,
    ).toBe(true);
  });

  it("rejects overlap between disable + enable", () => {
    const r = ArchetypeSkillOverridesSchema.safeParse({
      disable: ["a", "b"],
      enable: ["b", "c"],
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes("disables and enables"))).toBe(true);
    }
  });

  it("fills empty defaults", () => {
    const parsed = ArchetypeSkillOverridesSchema.parse({});
    expect(parsed.disable).toEqual([]);
    expect(parsed.enable).toEqual([]);
  });
});

describe("ArchetypeTemplateOverrideSchema", () => {
  it("accepts a valid override", () => {
    expect(
      ArchetypeTemplateOverrideSchema.safeParse({
        template: "prd",
        source: "archetypes/research/prd.md",
        reason: "research-shaped",
      }).success,
    ).toBe(true);
  });

  it("rejects empty source path", () => {
    expect(
      ArchetypeTemplateOverrideSchema.safeParse({
        template: "prd",
        source: "",
        reason: "x",
      }).success,
    ).toBe(false);
  });
});

describe("ArchetypeManifestSchema", () => {
  const baseline = {
    schema_version: 1 as const,
    id: "demo",
    name: "Demo",
    description: "demo manifest",
    status: "experimental" as const,
  };

  it("accepts a minimal manifest", () => {
    expect(ArchetypeManifestSchema.safeParse(baseline).success).toBe(true);
  });

  it("fills sensible defaults for arrays + priority + skill_overrides", () => {
    const parsed = ArchetypeManifestSchema.parse(baseline);
    expect(parsed.priority).toBe(0);
    expect(parsed.subagent_overrides).toEqual([]);
    expect(parsed.template_overrides).toEqual([]);
    expect(parsed.skill_overrides).toEqual({ disable: [], enable: [] });
  });

  it("rejects priority outside 0..100", () => {
    expect(
      ArchetypeManifestSchema.safeParse({ ...baseline, priority: 101 }).success,
    ).toBe(false);
  });

  it("rejects unknown status", () => {
    expect(
      ArchetypeManifestSchema.safeParse({
        ...baseline,
        status: "alpha",
      }).success,
    ).toBe(false);
  });

  it("rejects schema_version != 1", () => {
    expect(
      ArchetypeManifestSchema.safeParse({ ...baseline, schema_version: 2 })
        .success,
    ).toBe(false);
  });
});

describe("loadArchetype", () => {
  it("loads each shipped archetype + cross-checks id===filename", async () => {
    for (const slug of SHIPPED_ARCHETYPES) {
      const m = await loadArchetype(slug, { archetypesDir: shippedDir });
      expect(m.id, `${slug}.id`).toBe(slug);
      expect(m.schema_version, `${slug}.schema_version`).toBe(1);
    }
  });

  it("throws ArchetypeNotFoundError for unknown slug", async () => {
    await expect(
      loadArchetype("nope", { archetypesDir: shippedDir }),
    ).rejects.toBeInstanceOf(ArchetypeNotFoundError);
  });

  it("throws ArchetypeManifestError on malformed YAML", async () => {
    const path = join(workDir, "broken.yaml");
    await writeFile(path, "id: ::: invalid: yaml: ::\n", "utf8");
    await expect(
      loadArchetype("broken", { archetypesDir: workDir }),
    ).rejects.toBeInstanceOf(ArchetypeManifestError);
  });

  it("throws ArchetypeManifestError when id disagrees with filename", async () => {
    const path = join(workDir, "alpha.yaml");
    await writeFile(
      path,
      "schema_version: 1\nid: beta\nname: B\ndescription: x\nstatus: experimental\n",
      "utf8",
    );
    await expect(
      loadArchetype("alpha", { archetypesDir: workDir }),
    ).rejects.toThrow(/does not match filename/);
  });

  it("surfaces specific Zod issues on schema-invalid manifest", async () => {
    const path = join(workDir, "bad.yaml");
    await writeFile(
      path,
      "schema_version: 1\nid: bad\nname: Bad\ndescription: x\nstatus: experimental\npriority: 999\n",
      "utf8",
    );
    try {
      await loadArchetype("bad", { archetypesDir: workDir });
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ArchetypeManifestError);
      const issues = (err as ArchetypeManifestError).issues;
      expect(issues.some((i) => i.path === "priority")).toBe(true);
    }
  });
});

describe("loadShippedArchetypes", () => {
  it("returns all 4 v1 archetypes in registry order", async () => {
    const all = await loadShippedArchetypes({ archetypesDir: shippedDir });
    expect(all).toHaveLength(4);
    expect(all.map((a) => a.id)).toEqual([
      "app-build",
      "data-heavy",
      "infrastructure",
      "research",
    ]);
  });

  it("the app-build archetype declares no overrides (it is the baseline)", async () => {
    const appBuild = (
      await loadShippedArchetypes({ archetypesDir: shippedDir })
    ).find((a) => a.id === "app-build")!;
    expect(appBuild.subagent_overrides).toEqual([]);
    expect(appBuild.skill_overrides.disable).toEqual([]);
    expect(appBuild.skill_overrides.enable).toEqual([]);
    expect(appBuild.template_overrides).toEqual([]);
    expect(appBuild.status).toBe("stable");
  });

  it("data-heavy + research swap subagents at Phase 6", async () => {
    const all = await loadShippedArchetypes({ archetypesDir: shippedDir });
    const data = all.find((a) => a.id === "data-heavy")!;
    const research = all.find((a) => a.id === "research")!;
    expect(
      data.subagent_overrides.some((o) => o.phase === 6 && o.replace === "developer"),
    ).toBe(true);
    expect(
      research.subagent_overrides.some(
        (o) => o.phase === 6 && o.replace === "developer",
      ),
    ).toBe(true);
  });

  it("infrastructure swaps @pm → @architect at Phase 4", async () => {
    const infra = (
      await loadShippedArchetypes({ archetypesDir: shippedDir })
    ).find((a) => a.id === "infrastructure")!;
    expect(
      infra.subagent_overrides.some(
        (o) => o.phase === 4 && o.replace === "pm" && o.replace_with === "architect",
      ),
    ).toBe(true);
  });
});

describe("isShippedArchetype", () => {
  it("recognises the four v1 archetypes", () => {
    for (const slug of SHIPPED_ARCHETYPES) {
      expect(isShippedArchetype(slug)).toBe(true);
    }
  });

  it("rejects unknown slugs", () => {
    expect(isShippedArchetype("anything-else")).toBe(false);
  });
});

describe("Disk vs registry — coverage invariant", () => {
  it("install/archetypes/ contains exactly the SHIPPED_ARCHETYPES YAMLs", async () => {
    const { readdir } = await import("node:fs/promises");
    const files = (await readdir(shippedDir))
      .filter((f) => f.endsWith(".yaml"))
      .map((f) => f.replace(/\.yaml$/, ""))
      .sort();
    expect(files).toEqual([...SHIPPED_ARCHETYPES].sort());
  });
});
