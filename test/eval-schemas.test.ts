import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { describe, expect, it } from "vitest";
import { EvalResultSchema, EvalTaskSchema } from "../schemas/eval-task.schema";
import { FailureTaxonomySchema, taxonomyIds } from "../schemas/failure-taxonomy.schema";
import { discoverTasks } from "../src/evals/run";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const taxonomyYaml = parseYaml(readFileSync(join(repoRoot, "data/failure-taxonomy.yaml"), "utf8"));

describe("failure-taxonomy (WS7-A)", () => {
  it("the shipped data/failure-taxonomy.yaml validates", () => {
    const res = FailureTaxonomySchema.safeParse(taxonomyYaml);
    if (!res.success) throw new Error(JSON.stringify(res.error.issues, null, 2));
    expect(res.success).toBe(true);
  });

  it("covers the §4.8 core failure classes with unique ids", () => {
    const ids = taxonomyIds(taxonomyYaml);
    for (const core of [
      "wrong-file-target",
      "hallucinated-api",
      "skipped-gate",
      "schema-violation",
      "spec-misread",
      "over-scoped-diff",
      "stale-context",
      "design-token-violation",
      "estimate-blown",
      "hidden-dependency",
    ]) {
      expect(ids.has(core)).toBe(true);
    }
  });

  it("rejects a duplicate class id", () => {
    const dup = {
      version: 1,
      classes: [
        { id: "x", category: "gate", description: "a", default_severity: "high" },
        { id: "x", category: "gate", description: "b", default_severity: "low" },
      ],
    };
    expect(FailureTaxonomySchema.safeParse(dup).success).toBe(false);
  });
});

describe("eval-task schema (WS7-A)", () => {
  const task = {
    schema_version: 1,
    id: "lite-spec-produces-spec-md",
    description: "Running the lite Spec skill produces a schema-valid spec.md",
    lane: "lite",
    prompt: "Run the lite Spec phase for a simple todo app.",
    checks: [
      { kind: "file-exists", target: "_context/spec.md" },
      { kind: "gate-green", target: "spec" },
    ],
    guards_against: ["skipped-gate", "schema-violation"],
  };

  it("validates a well-formed task", () => {
    const res = EvalTaskSchema.safeParse(task);
    if (!res.success) throw new Error(JSON.stringify(res.error.issues, null, 2));
    expect(res.success).toBe(true);
  });

  it("a task's guards_against are all valid taxonomy ids", () => {
    const ids = taxonomyIds(taxonomyYaml);
    const parsed = EvalTaskSchema.parse(task);
    for (const tag of parsed.guards_against) expect(ids.has(tag)).toBe(true);
  });

  it("requires at least one check", () => {
    expect(EvalTaskSchema.safeParse({ ...task, checks: [] }).success).toBe(false);
  });

  it("validates an eval result", () => {
    const result = {
      task_id: task.id,
      passed: false,
      checks: [{ kind: "gate-green", target: "spec", passed: false }],
      taxonomy_tags: ["skipped-gate"],
    };
    expect(EvalResultSchema.safeParse(result).success).toBe(true);
  });
});

describe("shipped golden-task corpus (WS7-F)", () => {
  const tasks = discoverTasks(join(repoRoot, "evals")); // throws if any task is invalid
  const ids = taxonomyIds(taxonomyYaml);

  it("ships a starter set of well-formed golden tasks", () => {
    expect(tasks.length).toBeGreaterThanOrEqual(8);
  });

  it("every task's guards_against references valid taxonomy ids", () => {
    for (const { task } of tasks) {
      for (const tag of task.guards_against) {
        expect(ids.has(tag), `${task.id}: unknown taxonomy tag '${tag}'`).toBe(true);
      }
    }
  });

  it("task ids are unique", () => {
    const seen = new Set(tasks.map((t) => t.task.id));
    expect(seen.size).toBe(tasks.length);
  });
});
