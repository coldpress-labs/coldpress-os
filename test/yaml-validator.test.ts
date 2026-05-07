import { describe, expect, it } from "vitest";
import {
  ColdpressYamlValidationError,
  assertValidColdpressYaml,
  validateColdpressYaml,
} from "../src/utils/yaml-validator";

const validPhase1Yaml = `
project:
  name: "My Project"
  slug: "my-project"
user:
  name: "Aastha"
  communication_language: "English"
  document_output_language: "English"
butler:
  display_name: "Butler"
`;

describe("yaml-validator", () => {
  describe("happy path", () => {
    it("accepts a well-formed Phase-1 yaml at init", () => {
      const result = validateColdpressYaml(validPhase1Yaml, { phase: "init" });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("accepts yaml with no butler block (optional)", () => {
      const yaml = `
project:
  name: "P"
  slug: "p"
user:
  name: "U"
`;
      const result = validateColdpressYaml(yaml, { phase: "init" });
      expect(result.valid).toBe(true);
    });

    it("accepts runtime yaml with Phase-3 fields populated", () => {
      const yaml = `
project:
  name: "P"
  slug: "p"
  type: "saas"
  domain: "analytics"
  pattern: "b"
user:
  name: "U"
stack_pack: "vibe-coder-fullstack"
agents:
  developer:
    mode: "quick"
sacred_docs:
  prd: "_context/sacred/prd.md"
`;
      const result = validateColdpressYaml(yaml, { phase: "runtime" });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("required fields", () => {
    it("rejects missing project.name", () => {
      const yaml = `
project:
  slug: "p"
user:
  name: "U"
`;
      const result = validateColdpressYaml(yaml);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === "project.name")).toBe(true);
    });

    it("rejects missing project.slug", () => {
      const yaml = `
project:
  name: "P"
user:
  name: "U"
`;
      const result = validateColdpressYaml(yaml);
      expect(result.errors.some((e) => e.path === "project.slug")).toBe(true);
    });

    it("rejects missing user.name", () => {
      const yaml = `
project:
  name: "P"
  slug: "p"
user:
  communication_language: "English"
`;
      const result = validateColdpressYaml(yaml);
      expect(result.errors.some((e) => e.path === "user.name")).toBe(true);
    });

    it("rejects missing project section entirely", () => {
      const yaml = `user: { name: "U" }`;
      const result = validateColdpressYaml(yaml);
      expect(result.errors.some((e) => e.path === "project")).toBe(true);
    });

    it("rejects empty-string required fields", () => {
      const yaml = `
project:
  name: ""
  slug: ""
user:
  name: ""
`;
      const result = validateColdpressYaml(yaml);
      expect(result.errors.map((e) => e.path).sort()).toEqual([
        "project.name",
        "project.slug",
        "user.name",
      ]);
    });
  });

  describe("type checks", () => {
    it("rejects non-string project.name", () => {
      const yaml = `
project:
  name: 42
  slug: "p"
user:
  name: "U"
`;
      const result = validateColdpressYaml(yaml);
      expect(result.errors.some((e) => e.path === "project.name")).toBe(true);
    });

    it("rejects non-kebab-case slug", () => {
      const yaml = `
project:
  name: "P"
  slug: "My_Slug!"
user:
  name: "U"
`;
      const result = validateColdpressYaml(yaml);
      expect(result.errors.find((e) => e.path === "project.slug")?.message).toMatch(/kebab-case/);
    });
  });

  describe("enum validation", () => {
    it("rejects invalid user.cadence", () => {
      const yaml = `
project:
  name: "P"
  slug: "p"
user:
  name: "U"
  cadence: "quiet"
`;
      const result = validateColdpressYaml(yaml);
      const issue = result.errors.find((e) => e.path === "user.cadence");
      expect(issue?.message).toContain("silent|summary|verbose");
      expect(issue?.message).toContain('"quiet"');
    });

    it("accepts valid user.cadence", () => {
      for (const c of ["silent", "summary", "verbose"]) {
        const yaml = `
project:
  name: "P"
  slug: "p"
user:
  name: "U"
  cadence: "${c}"
`;
        expect(validateColdpressYaml(yaml).valid).toBe(true);
      }
    });

    it("rejects invalid user.team_shape", () => {
      const yaml = `
project:
  name: "P"
  slug: "p"
user:
  name: "U"
  team_shape: "individual"
`;
      const result = validateColdpressYaml(yaml);
      expect(result.errors.some((e) => e.path === "user.team_shape")).toBe(true);
    });

    it("accepts user.preferred_ides as string array", () => {
      const yaml = `
project:
  name: "P"
  slug: "p"
user:
  name: "U"
  preferred_ides:
    - "claude-code"
    - "cursor"
`;
      expect(validateColdpressYaml(yaml).valid).toBe(true);
    });

    it("rejects preferred_ides with non-string items", () => {
      const yaml = `
project:
  name: "P"
  slug: "p"
user:
  name: "U"
  preferred_ides:
    - "claude-code"
    - 42
`;
      expect(validateColdpressYaml(yaml).valid).toBe(false);
    });
  });

  describe("phase-ownership", () => {
    it("rejects Phase-3 stack_pack at init", () => {
      const yaml = `${validPhase1Yaml}\nstack_pack: "vibe-coder-fullstack"`;
      const result = validateColdpressYaml(yaml, { phase: "init" });
      expect(result.errors.some((e) => e.path === "stack_pack")).toBe(true);
    });

    it("rejects Phase-3 agents block at init", () => {
      const yaml = `${validPhase1Yaml}\nagents: { developer: { mode: "quick" } }`;
      const result = validateColdpressYaml(yaml, { phase: "init" });
      expect(result.errors.some((e) => e.path === "agents")).toBe(true);
    });

    it("rejects Phase-4 sacred_docs at init", () => {
      const yaml = `${validPhase1Yaml}\nsacred_docs: { prd: "_context/sacred/prd.md" }`;
      const result = validateColdpressYaml(yaml, { phase: "init" });
      expect(result.errors.some((e) => e.path === "sacred_docs")).toBe(true);
    });

    it("accepts those same fields at runtime", () => {
      const yaml = `${validPhase1Yaml}\nstack_pack: "vibe-coder-fullstack"\nagents: { developer: { mode: "quick" } }`;
      expect(validateColdpressYaml(yaml, { phase: "runtime" }).valid).toBe(true);
    });
  });

  describe("retrofit flag (Wave 2.2)", () => {
    it("accepts retrofit: true", () => {
      const yaml = `${validPhase1Yaml}\nretrofit: true`;
      expect(validateColdpressYaml(yaml, { phase: "init" }).valid).toBe(true);
    });

    it("rejects retrofit: 'yes'", () => {
      const yaml = `${validPhase1Yaml}\nretrofit: "yes"`;
      const result = validateColdpressYaml(yaml, { phase: "init" });
      expect(result.errors.some((e) => e.path === "retrofit")).toBe(true);
    });
  });

  describe("parse errors", () => {
    it("reports yaml parse failure as a single error", () => {
      const yaml = `project:\n  name: "P\n  slug: missing-close-quote`;
      const result = validateColdpressYaml(yaml);
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.path).toBe("(root)");
      expect(result.errors[0]?.message).toMatch(/yaml parse failed/);
    });

    it("rejects a non-mapping root", () => {
      const result = validateColdpressYaml(`- just\n- a\n- list`);
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.message).toMatch(/mapping/);
    });
  });

  describe("assertValidColdpressYaml", () => {
    it("returns parsed data on success", () => {
      const data = assertValidColdpressYaml(validPhase1Yaml, { phase: "init" }) as {
        project: { name: string };
      };
      expect(data.project.name).toBe("My Project");
    });

    it("throws ColdpressYamlValidationError on failure with all issues", () => {
      try {
        assertValidColdpressYaml(`project: {}\nuser: {}`, { phase: "init" });
        expect.fail("should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ColdpressYamlValidationError);
        const typed = err as ColdpressYamlValidationError;
        expect(typed.issues.length).toBeGreaterThanOrEqual(3);
        expect(typed.message).toContain("project.name");
      }
    });
  });
});
